interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Shown when a page fails to load its data.
 *
 * A client uses this app on gym wifi, where requests fail routinely. Without
 * a visible failure state the page renders blank or crashes, which is
 * indistinguishable from "you have no programs" — so retry has to be offered
 * rather than leaving a refresh as the only recourse.
 *
 * retryLabel defaults to the English literal rather than reading useLocale()
 * internally: app/global-error.tsx renders this component outside
 * LocaleProvider (it replaces the root layout, which is what mounts the
 * provider), so an internal useLocale() call would throw inside the crash
 * handler itself. Every other call site — coach included, since coach pages
 * now use useLocale() too — passes retryLabel={t("common.retry")} explicitly.
 */
export function ErrorState({ message, onRetry, retryLabel = "Try again" }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-10 text-center"
    >
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
