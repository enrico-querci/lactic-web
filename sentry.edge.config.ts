import * as Sentry from "@sentry/nextjs";

// Same rationale as sentry.server.config.ts — present for whatever Next.js's
// edge runtime touches, even though this app has no middleware or edge
// routes of its own today. Inert without a DSN.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.VERCEL_ENV ?? "development",
    tracesSampleRate: 0,
  });
}
