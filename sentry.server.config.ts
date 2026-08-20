import * as Sentry from "@sentry/nextjs";

// This app is a static export served from the client — every page is
// "use client" and talks directly to the Rails API, so the Node runtime
// sees little beyond the initial document request. Configured anyway, for
// whatever server-side rendering and route handling Next.js itself does.
// Inert without a DSN, matching instrumentation-client.ts and the Rails side.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.VERCEL_ENV ?? "development",
    tracesSampleRate: 0,
  });
}
