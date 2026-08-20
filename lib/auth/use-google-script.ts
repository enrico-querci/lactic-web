import { useEffect } from "react";
import type { Locale } from "@/lib/i18n/context";

const SCRIPT_ID = "lactic-google-gsi";

// Google's hl (display language) param is read once, at script-load time —
// there's no runtime API to re-language an already-initialized button. A
// locale switch genuinely needs the script reloaded, but next/script's <Script>
// doesn't remove its tag on unmount, so a naive key={locale} remount leaves a
// stale tag behind on every switch (confirmed directly: toggling en->it left
// two <script src="...accounts.google.com..."> tags in the DOM at once,
// loading and initializing the SDK twice). Managing the tag by hand here
// removes the previous one before adding the next.
export function useGoogleIdentityScript(locale: Locale, onReady: () => void) {
  useEffect(() => {
    document.getElementById(SCRIPT_ID)?.remove();

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://accounts.google.com/gsi/client?hl=${locale}`;
    script.async = true;
    script.onload = onReady;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);
}
