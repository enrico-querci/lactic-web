import type { PageMeta } from "@/lib/api/types";
import { getStoredLocale } from "@/lib/i18n/context";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

/**
 * Every API failure throws one of these. `message` is still the plain
 * string every existing caller renders as-is, so nothing downstream had to
 * change — `status` and `path` are additive, for callers (currently just
 * lib/hooks/use-async.ts) that want to tell a routine 4xx apart from a
 * genuine 5xx or network failure without parsing the message text.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public path: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lactic_refresh_token");
}

export function setRefreshToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("lactic_refresh_token", token);
  } else {
    localStorage.removeItem("lactic_refresh_token");
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      setAccessToken(null);
      setRefreshToken(null);
      return false;
    }

    const data = await res.json();
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
    return true;
  } catch {
    setAccessToken(null);
    setRefreshToken(null);
    return false;
  }
}

interface RequestOptions {
  method: string;
  body?: unknown;
  params?: Record<string, string>;
}

async function request<T>(path: string, options: RequestOptions): Promise<T> {
  const res = await rawRequest(path, options);

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

/**
 * Performs the request and returns the raw Response, so callers that need
 * headers (pagination) or bytes (animations) can get at them. Handles the
 * 401-refresh-retry dance and throws on any other error status, so every
 * caller sees the same failure behaviour.
 */
async function rawRequest(path: string, options: RequestOptions): Promise<Response> {
  let url = `${BASE_URL}${path}`;

  if (options.params) {
    const searchParams = new URLSearchParams(options.params);
    url += `?${searchParams.toString()}`;
  }

  // The API resolves locale from Accept-Language when it falls through the
  // (currently always-empty) user.locale column — see Localizable in
  // lactic-api. Without this, it reads the BROWSER's header instead of the
  // app's own switcher, which is invisible until server content is actually
  // locale-dependent, then diverges silently. No Vary header is needed:
  // every request already carries Authorization and is uncacheable.
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Language": getStoredLocale(),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Auto-refresh on 401
  if (res.status === 401 && getRefreshToken()) {
    // Deduplicate concurrent refresh attempts
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;

    if (refreshed) {
      headers["Authorization"] = `Bearer ${accessToken}`;
      res = await fetch(url, {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
    } else {
      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      // status 401 here is nominal, not read off a response — refresh
      // itself failed, so there is no response to read a real status from.
      // Filtered as expected-not-a-bug in useAsync the same way any other
      // 401 is: the session genuinely did just expire.
      throw new ApiError("Session expired", 401, path);
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    const validationErrors = Array.isArray(error.errors)
      ? error.errors.join(", ")
      : null;
    throw new ApiError(error.error || validationErrors || `HTTP ${res.status}`, res.status, path);
  }

  return res;
}

export function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  return request<T>(path, { method: "GET", params });
}

/**
 * GET that also reads the pagination headers.
 *
 * The API deliberately keeps the body a bare array and puts the paging
 * metadata in X-Total-Count and friends, so existing callers were not broken
 * when pagination landed.
 */
export async function getPaged<T>(
  path: string,
  params?: Record<string, string>
): Promise<{ items: T[]; meta: PageMeta }> {
  const res = await rawRequest(path, { method: "GET", params });
  const items = (await res.json()) as T[];

  const header = (name: string, fallback: number) => {
    const value = Number(res.headers.get(name));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  };

  return {
    items,
    meta: {
      totalCount: header("X-Total-Count", items.length),
      page: header("X-Page", 1),
      perPage: header("X-Per-Page", items.length || 1),
      totalPages: header("X-Total-Pages", 1),
    },
  };
}

/**
 * Fetches a binary resource and returns an object URL for it.
 *
 * An <img src> cannot carry the JWT, so the bytes are fetched as an
 * authenticated blob. The caller owns the returned URL and MUST call
 * URL.revokeObjectURL on it, or the blob leaks for the life of the document.
 */
export async function getObjectUrl(apiPath: string): Promise<string> {
  // The API returns animation_url rooted at /api/v1, while rawRequest prefixes
  // BASE_URL which already ends in /api/v1. Strip the duplicate prefix rather
  // than making callers know about it.
  const path = apiPath.replace(/^\/api\/v1/, "");
  const res = await rawRequest(path, { method: "GET" });
  return URL.createObjectURL(await res.blob());
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body });
}

export function patch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "PATCH", body });
}

export function del<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "DELETE", body });
}
