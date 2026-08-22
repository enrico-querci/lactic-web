This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Set the backend and Google client configuration in `.env.local`:

```text
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_REVENUECAT_WEB_BILLING_KEY=rcb_...
```

`NEXT_PUBLIC_SENTRY_DSN` is optional — error tracking is inert without it,
which is how local development runs. In Vercel, `SENTRY_ORG`,
`SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` (none `NEXT_PUBLIC_`) are also
needed, but only for build-time source map upload; the Sentry Vercel
marketplace integration provisions all four automatically when connected.

`NEXT_PUBLIC_REVENUECAT_WEB_BILLING_KEY` is RevenueCat's **public** Web
Billing API key (safe to expose client-side — it's what `lib/billing/
revenuecat.ts` passes to `Purchases.configure`). It is a different key from
the backend's `REVENUECAT_SECRET_API_KEY` (see `lactic-api`'s README),
which must stay server-side only.

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
