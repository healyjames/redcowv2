# Migration Plan: Netlify → Cloudflare Pages

This document describes everything required to move this Astro whitelabel site off Netlify and deploy it to **Cloudflare Pages**. It is based on a review of the current codebase.

---

## 1. Current State (what depends on Netlify)

| Area | File | Netlify dependency |
|------|------|--------------------|
| Adapter | `astro.config.ts` | `import netlify from "@astrojs/netlify"` + `adapter: netlify()` |
| Dependency | `package.json` | `@astrojs/netlify` package |
| CI/CD | `.github/workflow/deploy.yaml` | `nwtgck/actions-netlify` action + `NETLIFY_AUTH_TOKEN` / `NETLIFY_SITE_ID` secrets |
| Ignore rules | `.gitignore` | `.netlify/` generated config folder |
| Client IP | `src/libs/utils/clientIp.ts` | Prioritises `x-nf-client-connection-ip` (Netlify-only header) |

### Architecture summary
- **Framework:** Astro v6 (`output: "static"`) with a React integration and a sitemap.
- **Server code:** There is **one server endpoint** — `src/pages/api/booking/index.ts` (`export const prerender = false`) — plus `src/pages/robots.txt.ts`. The booking endpoint is a serverless function; everything else is prerendered static HTML. An adapter is therefore still required (a pure static host is not enough unless the booking endpoint is re-architected).
- **Email:** The booking endpoint sends mail via **`nodemailer`** SMTP (`src/libs/email/transport.ts`, `sendEmailWithSmtp.ts`, and the `sendAdminBookingEmail` / `sendCustomerConfirmation` helpers).
- **Rate limiting:** `src/libs/utils/rateLimiter.ts` is an in-memory `Map` with a top-level `setInterval` cleanup.
- **Environment:** Managed by Astro's typed `astro:env` in `astro.config.ts` (server secrets: `SMTP_*`, `ALLOWED_ORIGINS`; client: `PUBLIC_BRAND`, `PUBLIC_SITE_URL`).

### Whitelabel model (must be preserved)
- `PUBLIC_BRAND` selects the active brand at **build time** and **runtime**:
  - `astro.config.ts` aliases `@brand → src/assets/${brand}` and reads `process.env.PUBLIC_BRAND`.
  - `scripts/setup-tsconfig.js` (run via `npm run setup` before dev/build) writes `tsconfig.json`, and copies `src/assets/<brand>/menus/*.pdf` into `public/menus`.
  - `src/libs/utils/routing.ts` reads `PUBLIC_BRAND` from `astro:env/client` to resolve brand images.
- The deploy workflow additionally prunes non-target brand asset folders and `sed`-replaces the default brand string (`redcow`) across `src/` before building. **This workflow is being removed** (see Section 7) — these steps are either unnecessary (the `sed` replace) or move into the build (asset scoping).
- **Implication for Cloudflare:** `PUBLIC_BRAND` must be present as a **build-time environment variable** on each Cloudflare Pages project. Nothing about the whitelabel mechanism is Netlify-specific, but it depends on the build environment being configured per brand.

---

## 2. Key Blocker: `nodemailer` on the Cloudflare runtime

Cloudflare Pages Functions run on the **Workers runtime**, not Node.js. `nodemailer` opens raw SMTP connections via Node's `net`/`tls` sockets and **does not work on Workers**, even with the `nodejs_compat` flag (Workers TCP is exposed through `cloudflare:sockets`, which nodemailer does not use).

**This is the single biggest change.** We are replacing `nodemailer` SMTP with the **Cloudflare Email Service** — Cloudflare's native transactional email product, called from the Worker via the **`send_email` binding** (`env.EMAIL.send(...)`). This is fully Workers-compatible, needs no third-party SDK or API key at runtime, and no raw sockets. See **Section 5a** for the full email migration.

---

## 3. Dependency Changes (`package.json`)

**Remove:**
- `@astrojs/netlify`
- `nodemailer` and `@types/nodemailer` (replaced by the Cloudflare Email Service binding)

**Add:**
- `@astrojs/cloudflare` — the Cloudflare adapter (a version compatible with Astro 6).
- `wrangler` (devDependency) — for local runtime emulation, `wrangler pages dev`, and deploys.
- **No email SDK is needed** — the `send_email` binding is provided natively by the Workers runtime. (Optionally add `@cloudflare/workers-types` as a devDependency for typing `env.EMAIL`.)

`dotenv` can stay (used by `scripts/setup-tsconfig.js` and `astro.config.ts` for local builds).

---

## 4. Astro Config Changes (`astro.config.ts`)

- Replace the import and adapter:
  ```diff
  - import netlify from "@astrojs/netlify";
  + import cloudflare from "@astrojs/cloudflare";
  ...
  - adapter: netlify(),
  + adapter: cloudflare({ platformProxy: { enabled: true } }),
  ```
  `platformProxy` gives local `astro dev` access to Cloudflare bindings/env.
- Keep `output: "static"` — with the adapter, only `prerender = false` routes become Functions.
- Keep the `@brand` / `@` Vite aliases and the `astro:env` schema. Drop the `SMTP_*` fields from `env.schema` (the Email Service binding is **not** an `astro:env` variable — it is a runtime binding accessed via `locals.runtime.env.EMAIL`). Keep the addressing values the app still needs as plain server config, e.g. `EMAIL_FROM` (must be on an onboarded domain), `EMAIL_FROM_NAME`, and `EMAIL_ADMIN` — these can remain `astro:env` server vars.
- Verify `import.meta.env.DEV` usage (in `clientIp.ts`) still behaves under `wrangler`/`platformProxy`.

---

## 5. New Cloudflare Config Files

### `wrangler.toml` (or `wrangler.jsonc`) — new file in repo root
```toml
name = "redcow"                     # per-brand project name
pages_build_output_dir = "./dist"
compatibility_date = "2024-11-01"   # use a current date
compatibility_flags = ["nodejs_compat"]

# Cloudflare Email Service binding used by the booking endpoint
[[send_email]]
name = "EMAIL"
# Optional hardening: restrict the sender address(es) this binding may use.
# allowed_sender_addresses = ["bookings@yourdomain.com"]
```
`nodejs_compat` is needed for Node built-ins still referenced by Astro output. `send_email` exposes the Email Service to the Worker as `env.EMAIL`. Confirm the final bundle no longer pulls in `nodemailer` before relying on `nodejs_compat`.

> **Restriction note:** A binding with **no** `destination_address` / `allowed_destination_addresses` can send to any *verified destination address* **before** domain onboarding, and to **any** recipient **after** the sending domain is onboarded. Because the booking flow emails **arbitrary customer addresses** (the confirmation email), the sending domain **must be onboarded** (see Section 5a) — do **not** lock the binding to a fixed `destination_address`.

### 5a. Cloudflare Email Service migration (the email path)

The booking endpoint sends **two** emails: an **admin notification** (fixed internal address) and a **customer confirmation** (arbitrary external address). Both go through the same `send_email` binding.

**One-time setup (per brand / sending domain):**
1. In the Cloudflare dashboard, open **Email Service** and **onboard the sending domain** (add the required SPF/DKIM/DMARC DNS records and verify). This is mandatory to email arbitrary customer addresses — without onboarding you can only send to individually *verified destination addresses*, which is fine for the admin email but **not** for customer confirmations.
2. Ensure the `from` address (`EMAIL_FROM`) belongs to that onboarded domain.
3. Add the `send_email` binding (Section 5) to the Pages project (via `wrangler.toml` and/or the dashboard **Settings → Functions → Bindings**).
4. Be aware of platform limits: up to **50 recipients** combined across `to`/`cc`/`bcc` per message, **5 MiB** max message size, and a **conservative starting daily quota** that grows with good sending reputation (request increases via support if needed).

**Binding API (used in the rewritten email libs):**
```ts
// env.EMAIL is the send_email binding
const { messageId } = await env.EMAIL.send({
    to: "customer@example.com",
    from: "Red Cow <bookings@yourdomain.com>",
    subject: "Your booking confirmation",
    html: "<h1>See you soon</h1>",
    text: "See you soon",
    replyTo: "bookings@yourdomain.com",
});
// Errors throw with .code and .message — wrap in try/catch.
```

**Accessing the binding in Astro:** the Cloudflare adapter exposes runtime bindings on `Astro.locals.runtime.env`, **not** through `astro:env`. So the booking route must read the binding from `locals` and pass it into the email helpers (see Section 6.1).

### `.gitignore`
- Replace `.netlify/` with Cloudflare/Wrangler artefacts:
  ```
  .wrangler/
  .dev.vars
  ```
- Keep `dist/`, `.astro/`, `tsconfig.json` entries.

### `.dev.vars` (local secrets, git-ignored)
Cloudflare's local equivalent of `.env` for server secrets during `wrangler pages dev`. Mirror the current `.env` server values (`ALLOWED_ORIGINS`, email addressing config). The `send_email` binding itself is emulated by `wrangler dev` — see Section 9.

---

## 6. Code Changes

### 6.1 Email sending (required)
- Rewrite `src/libs/email/transport.ts`, `sendEmailWithSmtp.ts`, `sendAdminBookingEmail`, and `sendCustomerConfirmation` to use the **`send_email` binding** (`env.EMAIL.send({...})`) instead of `nodemailer.createTransport`.
- **Signature change:** unlike SMTP config (read from `astro:env/server` at module load), the binding is a per-request runtime object. The helpers must **receive the binding** as an argument, e.g. `sendAdminBookingEmail(emailBinding, data)`. Update the booking route to pull it from `locals`:
  ```ts
  export const POST: APIRoute = async ({ request, locals }) => {
      const email = locals.runtime.env.EMAIL; // send_email binding
      ...
      await Promise.all([
          sendAdminBookingEmail(email, transformedData),
          sendCustomerConfirmation(email, transformedData),
      ]);
  };
  ```
- Map the old `nodemailer` fields to the binding: `from` → `"${EMAIL_FROM_NAME} <${EMAIL_FROM}>"`, `to`, `replyTo`, `subject`, `text`, `html`. `sendMail` returns `info.messageId`; the binding returns `{ messageId }`.
- **Keep** `generateEmailHtml` / `generateEmailHTML` unchanged — HTML body generation is provider-agnostic and reusable.
- Delete the `SMTP_*` imports from `astro:env/server`; replace with `EMAIL_FROM`, `EMAIL_FROM_NAME`, `EMAIL_ADMIN` (still `astro:env` server vars).
- Wrap `env.EMAIL.send(...)` in `try/catch` — errors throw with `.code` / `.message`; the route already re-throws email failures as a 500.

### 6.2 Client IP (recommended)
`src/libs/utils/clientIp.ts` — reorder so **`cf-connecting-ip`** is the primary source on Cloudflare, and drop/deprioritise the Netlify `x-nf-client-connection-ip` header:
```ts
headers.get("cf-connecting-ip") ||
(headers.get("x-forwarded-for") || "").split(",")[0]?.trim() ||
headers.get("true-client-ip") ||
(import.meta.env.DEV ? "127.0.0.1" : "unknown")
```

### 6.3 Rate limiter (note / recommended)
`src/libs/utils/rateLimiter.ts` uses a module-level `Map` + top-level `setInterval`. On the Workers runtime:
- Top-level `setInterval` is not supported the same way and global state is per-isolate and non-durable, so limits are best-effort only (this is already true on Netlify Functions).
- Remove the top-level `setInterval` (do lazy cleanup inside `checkRateLimit`) to avoid runtime warnings/errors.
- For real distributed rate limiting, back it with **Cloudflare KV** (or the Rate Limiting binding / Durable Objects) and add the binding to `wrangler.toml`. Optional but recommended for production.

### 6.4 `robots.txt` endpoint
`src/pages/robots.txt.ts` uses only the standard `site` object — no change needed.

---

## 7. Deployment — Cloudflare Pages Git Integration (auto-deploy on push to `main`)

**No GitHub Actions CI/CD.** Cloudflare Pages connects directly to the GitHub repo and builds + deploys automatically on every push to `main`. **Delete `.github/workflow/deploy.yaml`** entirely.

### Setup (per brand)
This is a whitelabel site, so create **one Cloudflare Pages project per brand**, all connected to the **same repo** with **production branch = `main`**:
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Production branch:** `main` → a push to `main` triggers a production deploy for every brand project.
- **Build environment variables (per project):** `PUBLIC_BRAND` (the brand for that project), `PUBLIC_SITE_URL`, and `NODE_VERSION` (e.g. `20`).
- **Runtime env vars / secrets (per project):** `ALLOWED_ORIGINS`, `EMAIL_FROM`, `EMAIL_FROM_NAME`, `EMAIL_ADMIN`.
- **Bindings (per project):** the `send_email` binding (`EMAIL`) — declared in `wrangler.toml` and/or under **Settings → Functions → Bindings**.

A single push to `main` fans out to all brand projects; each rebuilds with its own `PUBLIC_BRAND`.

### Whitelabel theming without the workflow
The old `.github/workflow/deploy.yaml` did two brand steps that must now be handled by the build itself:

1. **`sed` replace of `redcow` → brand:** **Not needed for correctness.** Brand selection is already driven by `PUBLIC_BRAND` at build time (`astro.config.ts` `@brand` alias, `scripts/setup-tsconfig.js`, and `src/libs/utils/routing.ts`). The only literal `redcow` occurrences in `src/` are inside the `redcow` **brand asset folder** itself (`src/assets/redcow/content/data.ts`) plus one code comment — each brand has its own `src/assets/<brand>/content/data.ts`, so no cross-file string replacement is required. The `sed` step can be dropped.
2. **Pruning non-target brand asset folders:** This was a **bundle-size** optimisation, not correctness. Note that `src/libs/utils/routing.ts` uses `import.meta.glob('/src/assets/*/images/*', { eager: true })`, which eagerly bundles **every** brand's images into **every** build. With Git-integration builds (no prune step), each brand deploy would ship all brands' images. **Recommended fix:** scope the glob to the active brand so pruning is unnecessary, e.g. build the glob path from `PUBLIC_BRAND` (or filter the glob result to keys starting with `/src/assets/${brand}/`). If that refactor is deferred, add a `prebuild` npm script that removes other `src/assets/*` folders based on `PUBLIC_BRAND` before `astro build`.

### Preview deployments (optional)
Pushes to non-`main` branches / PRs produce Cloudflare **preview** deployments automatically. Configure the same build/runtime vars for the "Preview" environment if you want working previews.

### First-deploy prerequisites
Before the first push-to-deploy: the sending domain must be **onboarded in Email Service** (Section 5a) and the `send_email` binding + `EMAIL_*` vars must exist on each project, otherwise the booking endpoint's emails will fail at runtime.

---

## 8. Environment Variables Mapping

| Variable | Type | Where on Cloudflare |
|----------|------|---------------------|
| `PUBLIC_BRAND` | build-time (client) | Pages project build env var (per brand) |
| `PUBLIC_SITE_URL` | build-time (client) | Pages project build env var (per brand) |
| `ALLOWED_ORIGINS` | runtime (server secret) | Pages project secret / `.dev.vars` |
| `EMAIL_FROM`, `EMAIL_FROM_NAME`, `EMAIL_ADMIN` | runtime (server) | Pages env vars / `.dev.vars` (`EMAIL_FROM` must be on the onboarded domain) |
| `EMAIL` (send_email binding) | runtime binding | `wrangler.toml` `[[send_email]]` + Pages → Functions → Bindings (not `astro:env`) |
| ~~`SMTP_HOST/PORT/SECURE/USER/PASS/FROM_NAME/FROM_EMAIL/ADMIN_EMAIL`~~ | removed | replaced by the `send_email` binding + `EMAIL_*` addressing vars |

`PUBLIC_*` values are inlined at build time, so they must exist in the **build** environment, not just at runtime. Secrets must exist in the **Functions runtime** environment.

---

## 9. Local Development

- `npm run dev` (Astro dev) continues to work for static pages.
- To exercise the booking **Function** against the Cloudflare runtime locally, use `wrangler pages dev` (after build) or rely on `platformProxy` in `astro dev`. `wrangler dev` emulates the `send_email` binding locally (it logs/simulates the message rather than delivering it; see Cloudflare's "local development for email sending" docs for known limitations).
- Provide local server config via `.dev.vars` (`ALLOWED_ORIGINS`, `EMAIL_*`).

---

## 10. Step-by-Step Checklist

1. [ ] Onboard the sending domain in **Cloudflare Email Service** (SPF/DKIM/DMARC DNS + verify) so customer confirmations to arbitrary addresses are allowed.
2. [ ] `npm remove @astrojs/netlify nodemailer @types/nodemailer`.
3. [ ] `npm install @astrojs/cloudflare` and `npm install -D wrangler @cloudflare/workers-types`.
4. [ ] Update `astro.config.ts` adapter and `astro:env` schema (drop `SMTP_*`, add `EMAIL_*`).
5. [ ] Add `wrangler.toml` with `nodejs_compat`, `pages_build_output_dir`, and the `[[send_email]]` binding.
6. [ ] Rewrite email libs to `env.EMAIL.send(...)`; pass the binding from `locals.runtime.env` through the helpers; keep HTML generation.
7. [ ] Update `clientIp.ts` to prefer `cf-connecting-ip`; remove top-level `setInterval` in `rateLimiter.ts`.
8. [ ] Update `.gitignore` (`.wrangler/`, `.dev.vars`; drop `.netlify/`).
9. [ ] **Delete `.github/workflow/deploy.yaml`.** Connect the repo to Cloudflare Pages (one project per brand, production branch `main`); set build command `npm run build`, output `dist`, and per-project build vars, runtime vars, and the `send_email` binding (Section 7).
10. [ ] Configure Cloudflare Pages project(s), build env vars, runtime `EMAIL_*` vars, and the `send_email` binding per brand.
11. [ ] `npm run build` locally, then `wrangler pages dev ./dist` to smoke-test the booking endpoint + emails.
12. [ ] Deploy, verify: static pages, booking POST, **admin + customer email delivery**, `robots.txt`, sitemap, and per-brand assets/menus.
13. [ ] Update `README.md` with Cloudflare deploy/dev instructions.

---

## 11. Risk / Effort Summary

| Item | Effort | Risk |
|------|--------|------|
| Adapter swap + `wrangler.toml` | Low | Low |
| Email migration (nodemailer → Cloudflare Email Service `send_email` binding) | **Medium** | **Medium** (domain onboarding + deliverability + arbitrary-recipient rule) |
| Deployment via Pages Git integration (delete GH Actions workflow) | Low | Low |
| Whitelabel: scope image glob to active brand (replaces prune step) | Low–Medium | Medium (bundle size / build config per brand) |
| Rate limiter runtime fix (+ optional KV) | Low (Medium if KV) | Low |
| Client IP header reorder | Low | Low |
| Whitelabel build env wiring | Low | Medium (must set `PUBLIC_BRAND` per brand build) |

**Biggest risk:** the email path. The main gotcha is that Cloudflare Email Service only allows sending to **arbitrary recipients after the sending domain is onboarded** — until then it is limited to verified destination addresses, which would silently break the **customer confirmation** email. Onboard the domain first and test both emails on the Workers runtime early. Everything else is mechanical.
