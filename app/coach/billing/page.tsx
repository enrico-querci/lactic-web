"use client";

import { useCallback, useState } from "react";
import { ErrorCode, PurchasesError, type Package } from "@revenuecat/purchases-js";
import { getSubscription, syncSubscription } from "@/lib/api/endpoints/billing";
import { configurePurchases } from "@/lib/billing/revenuecat";
import type { Subscription } from "@/lib/api/types";
import { useAsync } from "@/lib/hooks/use-async";
import { useAuth } from "@/lib/auth/context";
import { useLocale } from "@/lib/i18n/context";
import type { MessageKey } from "@/lib/i18n/messages/en";
import { formatDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { ErrorBanner } from "@/components/ui/error-banner";

const PLAN_LABEL_KEYS: Record<Subscription["plan"], MessageKey> = {
  free: "billing.plan.free",
  pro: "billing.plan.pro",
  pro_plus: "billing.plan.pro_plus",
  unlimited: "billing.plan.unlimited",
  founding: "billing.plan.founding",
};

export default function BillingPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const subscription = useAsync("coach-subscription", useCallback(() => getSubscription(), []));

  // Offerings come straight from the RevenueCat dashboard rather than being
  // hardcoded here — price, title, and description all live in one place
  // and can't drift from what this page shows.
  const offerings = useAsync(
    "billing-offerings",
    useCallback(async () => {
      const purchases = configurePurchases(user!.id);
      const result = await purchases.getOfferings();
      return result.current?.availablePackages ?? [];
    }, [user])
  );

  const handleSubscribe = async (pkg: Package) => {
    setPurchaseError(null);
    setPurchasingId(pkg.identifier);
    try {
      const purchases = configurePurchases(user!.id);
      // Resolves once the embedded checkout completes — this is not a
      // redirect, so there is nothing to return to.
      await purchases.purchase({ rcPackage: pkg });
      const updated = await syncSubscription();
      subscription.mutate(() => updated);
    } catch (e) {
      const cancelled = e instanceof PurchasesError && e.errorCode === ErrorCode.UserCancelledError;
      if (!cancelled) {
        setPurchaseError(e instanceof Error ? e.message : t("billing.purchaseFailed"));
      }
    } finally {
      setPurchasingId(null);
    }
  };

  if (subscription.initial) return <Loading />;
  if (subscription.error) {
    return (
      <ErrorState
        message={subscription.error}
        onRetry={subscription.reload}
        retryLabel={t("common.retry")}
      />
    );
  }

  const sub = subscription.data!;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">{t("billing.title")}</h1>

      {purchaseError && (
        <ErrorBanner
          message={purchaseError}
          onDismiss={() => setPurchaseError(null)}
          dismissLabel={t("common.dismiss")}
        />
      )}

      <section className="mb-8 rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-medium text-zinc-500">{t("billing.currentPlan")}</h2>
        <p className="mt-1 text-lg font-semibold text-zinc-900">{t(PLAN_LABEL_KEYS[sub.plan])}</p>
        <p className="mt-1 text-sm text-zinc-500">
          {sub.client_limit === null
            ? t("billing.usageUnlimited", { used: sub.client_slots_used })
            : t("billing.usage", { used: sub.client_slots_used, limit: sub.client_limit })}
        </p>
        {sub.expires_at && (
          <p className="mt-1 text-sm text-zinc-500">
            {t("billing.expiresOn", { date: formatDate(sub.expires_at, locale) })}
          </p>
        )}
        {sub.billing_issue && (
          <p className="mt-2 text-sm text-red-600">{t("billing.billingIssue")}</p>
        )}
      </section>

      <h2 className="mb-3 text-lg font-semibold text-zinc-900">{t("billing.choosePlan")}</h2>

      {offerings.initial ? (
        <Loading />
      ) : offerings.error ? (
        <p className="text-sm text-zinc-400">{t("billing.loadOfferingsFailed")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(offerings.data ?? []).map((pkg) => (
            <div key={pkg.identifier} className="rounded-lg border border-zinc-200 bg-white p-4">
              <h3 className="font-semibold text-zinc-900">{pkg.webBillingProduct.title}</h3>
              {pkg.webBillingProduct.description && (
                <p className="mt-1 text-sm text-zinc-500">{pkg.webBillingProduct.description}</p>
              )}
              <p className="mt-3 text-xl font-bold text-zinc-900">
                {pkg.webBillingProduct.currentPrice.formattedPrice}
              </p>
              <Button
                className="mt-4 w-full"
                disabled={purchasingId === pkg.identifier}
                onClick={() => handleSubscribe(pkg)}
              >
                {purchasingId === pkg.identifier ? t("billing.subscribing") : t("billing.subscribe")}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
