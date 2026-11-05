"use client";

import { useEffect } from "react";

/**
 * While `dirty`, asks before anything throws the page's edits away: reload,
 * closing the tab and external links (the browser's own prompt), and in-app
 * links (the sidebar included), which are caught in the capture phase ahead
 * of the router.
 *
 * The browser's own back button and router.push() calls cannot be
 * intercepted here: a page that navigates by code asks for itself, and the
 * back button discards silently, like any form.
 */
export function useUnsavedChangesGuard(dirty: boolean, message: string) {
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || e.defaultPrevented) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (!confirm(message)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty, message]);
}
