# NAVSTAR DIGITAL HUB

Vite/React public site with same-repository Cloudflare Pages Functions. The production Pages app can serve the public site and `/api/*` backend from one GitHub-connected deployment.

## Deploy free hosting from Git

1. Sign in to Cloudflare and open **Workers & Pages → Create application → Pages → Connect to Git**.
2. Connect GitHub and select `navstarproductions-tech/Navstar-Digital-Hub-Site`, production branch `main`.
3. Use the Vite preset, build command `npm ci && npm run build:pages && npm run check:functions`, and output directory `dist`. Do not choose Direct Upload; the root `functions/` directory must deploy with Git integration.
4. Create a D1 database named `navstar-digital-hub`. In the Pages project, add a D1 binding named `DB` under **Settings → Bindings**.
5. Apply `db/migrations/0001_initial.sql`. With Wrangler installed and authenticated, run `npx wrangler d1 migrations apply navstar-digital-hub --remote --directory db/migrations` from the repository root.
6. To enable admin logo/gallery uploads, create an R2 bucket and bind it as `MEDIA` under **Settings → Bindings**.
7. Wait for the first successful deployment. Its address will be `https://<your-project-name>.pages.dev`.

Cloudflare currently offers free Workers/D1 usage within documented limits; check current pricing and usage before launch. A custom domain is purchased separately. Add it under **Custom domains**, follow Cloudflare's DNS instructions, then update `APP_ORIGIN` to the new HTTPS origin and redeploy.

## Configure secrets safely

In **Workers & Pages → your Pages project → Settings → Variables and Secrets**, add the following. Choose **Encrypt** for every secret. Never put secret values in Vite variables, source files, GitHub, screenshots, or chat.

Secrets:

- `DARAJA_CONSUMER_KEY`
- `DARAJA_CONSUMER_SECRET`
- `DARAJA_PASSKEY`
- `DARAJA_CALLBACK_TOKEN` (a new random value with at least 32 characters)
- `BOOTSTRAP_TOKEN` (a separate new random value with at least 32 characters)

Non-secret variables:

- `APP_ORIGIN` — the exact HTTPS origin, for example `https://your-project.pages.dev` (no trailing path)
- `DARAJA_SHORTCODE` — your business shortcode
- `DARAJA_ENVIRONMENT` — `sandbox` while testing; use `production` only after your production app and rotated credentials are verified
- `DARAJA_TRANSACTION_TYPE` — use the transaction type registered to your Daraja shortcode (`CustomerPayBillOnline` or `CustomerBuyGoodsOnline`)

Production credentials were exposed in chat. Revoke and rotate the consumer secret and passkey in Daraja before configuring these values. The site never asks a customer for their M-Pesa PIN; it is entered only on the official handset prompt.

After the backend deployment succeeds, open `/setup` on the HTTPS site, enter the `BOOTSTRAP_TOKEN`, and create the first Admin account with a unique password of at least 14 characters. Then remove `BOOTSTRAP_TOKEN` from Cloudflare Variables and Secrets and redeploy. The setup endpoint also closes after an Admin already exists.

## Features and backend routes

- Public routes: Home, Courses, Services, Donations, Portals, and full admissions forms.
- Portal roles: Student, Tutor, Admissions, Principal, and Admin. Sessions use HTTP-only, secure, same-site cookies; Admin APIs enforce role checks.
- D1 stores accounts, sessions, applications, donations, payment state, service/course records, notifications, media metadata, cashout requests, and audit history.
- R2 stores admin-uploaded gallery/logo images.
- Daraja STK requests and callbacks run only in Pages Functions. Payments are marked paid only after a callback matches the stored checkout, phone, amount, and receipt.
- Cashout requests are recorded for approval only; this project does not transfer money automatically.

Backend endpoints also include `/api/health`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`, `/api/auth/change-password`, `/api/admin/bootstrap`, `/api/admin/users`, `/api/admin/settings`, `/api/admin/media`, `/api/admin/notifications`, `/api/admin/cashouts`, `/api/payments/stk-push`, and `/api/payments/callback`.

## Local development

```powershell
npm install
npm run dev
```

For a Cloudflare-compatible local preview, run `npm run build:pages` then `npm run pages:dev`. The optional D1 and R2 bindings must be supplied/configured before testing authenticated and media operations.

The original `let-help-you-dashboard` Pages URL returns 404 because the GitHub repository was renamed. The current GitHub Pages fallback is `https://navstarproductions-tech.github.io/Navstar-Digital-Hub-Site/`. Cloudflare Pages builds use the root path automatically, so its `pages.dev` and custom-domain URLs do not inherit the GitHub project subpath.