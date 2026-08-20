import type { MessageKey } from "./en";

// Record<MessageKey, string> is the safety net: TypeScript rejects this file
// the moment en.ts gains a key without an Italian counterpart here.
export const it: Record<MessageKey, string> = {
  "nav.home": "Home",
  "nav.programs": "Programmi",
  "nav.history": "Cronologia",
  "nav.logOut": "Esci",

  "login.subtitle": "Accedi per continuare",
  "login.googleFailed": "Accesso con Google non riuscito",
  "login.devFailed": "Accesso non riuscito",
};
