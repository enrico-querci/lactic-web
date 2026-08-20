import * as Sentry from "@sentry/nextjs";

// Inert without a DSN — matches the Rails side (config/initializers/sentry.rb),
// so local development needs no special-casing.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",

    // false is already this SDK's default when the option is omitted —
    // confirmed against the installed @sentry/core source
    // (defaultPiiToCollectionOptions.ts): request/response bodies are never
    // captured either way, and headers/cookies go through a PII-pattern
    // deny-list. Set explicitly anyway, to state the stance rather than
    // lean on an unwritten default — mirrors send_default_pii=false in the
    // Rails initializer.
    sendDefaultPii: false,

    // Errors only for the pilot; tracing is volume and cost not needed yet.
    tracesSampleRate: 0,

    // Off on purpose. Session Replay records the DOM, and on coach pages
    // that means real gym clients' names and emails. Five pilot users don't
    // need it — revisit once masking is deliberately configured, not
    // opt-out.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // Thrown on every session expiry by lib/api/client.ts's refresh-failure
    // path (which also races a page unload via window.location.href) — not
    // a bug, not actionable, would otherwise be pure noise on top of the
    // status-based filtering in lib/hooks/use-async.ts.
    ignoreErrors: ["Session expired"],

    beforeBreadcrumb(breadcrumb) {
      // Invitation tokens live in the URL path (/invite/<token>), so a
      // navigation or fetch breadcrumb to that route carries a live
      // credential unless redacted.
      if (typeof breadcrumb.data?.url === "string") {
        breadcrumb.data.url = breadcrumb.data.url.replace(
          /\/invite\/[^/?#]+/,
          "/invite/[redacted]"
        );
      }
      return breadcrumb;
    },

    beforeSend(event) {
      // Authorization headers and the Google id_token (posted as a request
      // body field — see lib/auth/context.tsx) should never leave the
      // browser via an event. request.data below covers the body; headers
      // are covered defensively even though the SDK does not attach
      // Authorization by default.
      if (event.request?.headers) {
        delete event.request.headers["Authorization"];
        delete event.request.headers["authorization"];
      }
      if (
        event.request?.data &&
        typeof event.request.data === "object" &&
        "id_token" in event.request.data
      ) {
        (event.request.data as Record<string, unknown>).id_token = "[redacted]";
      }
      return event;
    },
  });
}

// Wires up navigation tracking for App Router transitions. Bounded by
// tracesSampleRate: 0 above either way — this doesn't turn tracing on by
// itself — but the SDK logs a build-time "ACTION REQUIRED" warning without
// it, so it's wired regardless.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
