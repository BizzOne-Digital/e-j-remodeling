# E&J Kitchen and Bathroom Remodeling, LLC

Next.js (App Router) website with booking, reviews, Stripe payments and a MongoDB-backed admin panel.

## Run locally

Requires Node 20.12 or newer.

    npm install --ignore-scripts
    cp .env.example .env.local      # then fill it in
    npm run dev

`npm run dev:memory` runs everything against a throwaway in-memory MongoDB (admin: `admin@example.com` / `local-demo-password`). For local demos only.

The `&` in this folder name breaks npm's Windows command shims, so every script calls Node directly. Use the npm scripts rather than `npx next`. Renaming the folder also avoids it.

Checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. The end-to-end suite is in `scripts/e2e.mjs`; start commands are at the top of the file. Run it only against a disposable database.

## Environment variables

| Variable | Needed for |
|---|---|
| `MONGODB_URI` | All forms, admin, uploads, payments. Without it, the public pages show default content. |
| `AUTH_SECRET` | Admin sign-in. 32 or more random characters. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, Stripe redirects. Set before building. |
| `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD` | First admin account only (password 12 to 72 characters). |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Online payments. Both are required. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Not used by hosted Checkout; reserved. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `ADMIN_NOTIFICATION_EMAIL` | Optional email. Submissions are stored either way. |

## MongoDB Atlas

1. Create a cluster and a user with read/write access to one database.
2. Allow network access from Vercel (Vercel's Atlas integration, or an allow-list that covers its addresses).
3. Put the connection string, including the database name, in `MONGODB_URI`.

Indexes are created automatically on first use. Default content is imported once, on the first admin sign-in, and is editable from then on.

## Admin account

Set `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD`, then sign in at `/admin/login`. The account is created on the first sign-in attempt while no admin exists. Or run `npm run admin:init`. Change the password under Account, then remove both variables.
Forgotten password: set the variables again and run `npm run admin:init -- --reset`.

## Stripe

1. Add the test `STRIPE_SECRET_KEY`.
2. Add a webhook endpoint for `https://YOUR-DOMAIN/api/webhooks/stripe` with: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`. Put its signing secret in `STRIPE_WEBHOOK_SECRET`.
3. In Admin > Payments create a request, open its link and pay with card `4242 4242 4242 4242`. The status must become Paid.
4. Repeat with live keys and a live webhook.

Amounts come only from the database, and only a signed webhook can mark a payment Paid. Refund from the Stripe dashboard; the status follows.

## Images

Uploads are stored in MongoDB, so they survive redeploys. Vercel limits request bodies to 4.5 MB: the admin accepts files up to 8 MB, compresses them in the browser and the server accepts up to 4 MB. GIFs are not compressed and must be under 4 MB.
The `gallery-*` photos are Unsplash stock (`scripts/fetch-images.py`); other photos in `public/images` were supplied for this project. `scripts/build-brand.mjs` renders the logo, icons and share image.

## Deploy to Vercel

Import the repository, add the environment variables, deploy, then set the domain and redeploy with the final `NEXT_PUBLIC_SITE_URL`.

## Waiting on the client

- MongoDB Atlas, Stripe (or a different provider) and SMTP credentials; domain
- Business hours, service area, address and social links (Admin > Settings; hidden while blank)
- Appointment days and times (Admin > Availability; placeholders are every day, Morning / Afternoon / Evening / Flexible)
- Genuine project photos and reviews
- Original logo file, if a vector exists; the current one is redrawn from the reference image
- Legal review of the Privacy Policy and Terms
