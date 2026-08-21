interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
  dismissLabel?: string;
}

/**
 * For a failed action (save, delete, status change) rather than a failed
 * page load — ErrorState replaces the page's content; this sits above
 * content that loaded fine and stays interactive. Dismissible because the
 * action already finished (there's nothing to retry automatically — the
 * user re-triggers it), unlike ErrorState's onRetry.
 *
 * Was duplicated identically across three coach pages before this existed.
 *
 * dismissLabel defaults to English rather than reading useLocale()
 * internally: this component is coach-only today, but ErrorState (which sits
 * right next to it in most call sites) can't call the hook — it's also
 * rendered from app/global-error.tsx, outside LocaleProvider — and matching
 * that shape here keeps the two consistent rather than one prop-driven and
 * one not for no functional reason.
 */
export function ErrorBanner({ message, onDismiss, dismissLabel = "Dismiss" }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="mb-4 flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-medium hover:bg-red-50"
      >
        {dismissLabel}
      </button>
    </div>
  );
}
