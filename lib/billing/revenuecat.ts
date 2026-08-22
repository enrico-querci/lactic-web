import { Purchases } from "@revenuecat/purchases-js";

// Always the Rails user id, never an anonymous RevenueCat id — this is
// what lets an entitlement purchased on the web carry over to the future
// iPad app under the same App User ID.
export function configurePurchases(userId: number): Purchases {
  if (Purchases.isConfigured()) return Purchases.getSharedInstance();

  return Purchases.configure({
    apiKey: process.env.NEXT_PUBLIC_REVENUECAT_WEB_BILLING_KEY!,
    appUserId: String(userId),
  });
}
