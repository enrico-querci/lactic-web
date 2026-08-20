import * as Sentry from "@sentry/nextjs";

// Next.js calls this once per runtime at startup. The config files
// themselves are each individually inert without a DSN, so no branching is
// needed here beyond picking the right one for the runtime that's booting.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Captures errors from Next.js's own request handling in the App Router
// (route handlers, server components) that would otherwise never reach a
// Sentry.captureException call.
export const onRequestError = Sentry.captureRequestError;
