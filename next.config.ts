import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// org, project and authToken are intentionally not passed here — the plugin
// reads them from SENTRY_ORG, SENTRY_PROJECT and SENTRY_AUTH_TOKEN itself.
// Without SENTRY_AUTH_TOKEN specifically, source maps are never uploaded and
// every stack trace in Sentry shows minified chunk names instead of real
// filenames and line numbers.
//
// `npm run build` (what Vercel deploys) uses Turbopack here — confirmed from
// the build output, not assumed; Next 16 defaults to it even without an
// explicit flag. @sentry/nextjs's source map upload runs through Next's
// runAfterProductionCompile hook, which fired correctly in that build
// (it logged the missing-auth-token warning this comment describes), so
// upload works regardless of which bundler produced the build.
export default withSentryConfig(nextConfig);
