import { useEffect, useRef } from "react";
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
  // onReady closes over caller state (e.g. invite page's `invitation`/`user`)
  // that can change between script-load-start and script-load-finish. The
  // effect below only reruns on locale changes, so binding script.onload
  // straight to the onReady argument would freeze whatever closure existed
  // at that render — on the invite page specifically, invitation data
  // resolving before the Google CDN script loads (the common case locally,
  // confirmed directly: a controlled A/B test logged the stale closure still
  // reporting invitation=null at the moment onload fired, two renders after
  // it had actually resolved) meant onload always fired with a stale
  // "invitation is still null" closure and the button never rendered.
  // Reading through a ref kept fresh on every render (via a bare-deps effect,
  // since react-hooks/refs forbids writing ref.current during render itself)
  // makes onload always call the latest closure, regardless of which
  // resolves first.
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    document.getElementById(SCRIPT_ID)?.remove();

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://accounts.google.com/gsi/client?hl=${locale}`;
    script.async = true;
    script.onload = () => onReadyRef.current();
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [locale]);
}
