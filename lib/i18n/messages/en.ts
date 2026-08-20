// The canonical key set. it.ts is typed against this file's keys (see it.ts),
// so adding a key here without its Italian counterpart is a build error, not
// a silent English fallback discovered later in the browser.
//
// Keys are flat and dot-joined ("nav.logOut") rather than nested objects —
// closer to NSLocalizedString/String(localized:) than a selector-based typed
// accessor, which matters here since this codebase's audience is an
// iOS-first developer.
export const en = {
  "nav.home": "Home",
  "nav.programs": "Programs",
  "nav.history": "History",
  "nav.logOut": "Log out",

  "login.subtitle": "Sign in to continue",
  "login.googleFailed": "Google login failed",
  "login.devFailed": "Login failed",
} as const;

export type MessageKey = keyof typeof en;
