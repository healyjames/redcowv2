# Migration Plan: Netlify → Cloudflare Workers

This document describes everything required to move this Astro whitelabel site off Netlify and deploy it to **Cloudflare Workers**. It is based on a review of the current codebase.

> **Revision note (2026-09-17):** this plan originally targeted **Cloudflare Pages**. That was wrong on two counts: `@astrojs/cloudflare` v14 (the version installed) is a **Workers-only** adapter and explicitly no longer supports Pages, and the `send_email` binding the email migration depends on **is not available to Pages Functions** at all. Sections 4, 5, 7, 8 and 9 have been rewritten for Workers.

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
- **Implication for Cloudflare:** `PUBLIC_BRAND` must be present as a **build-time environment variable** on each Worker's build settings. Nothing about the whitelabel mechanism is Netlify-specific, but it depends on the build environment being configured per brand.

---

## 2. Key Blocker: `nodemailer` on the Cloudflare runtime

Cloudflare runs your server code on the **Workers runtime** (`workerd`), not Node.js. `nodemailer` opens raw SMTP connections via Node's `net`/`tls` sockets and **does not work on Workers**, even with the `nodejs_compat` flag (Workers TCP is exposed through `cloudflare:sockets`, which nodemailer does not use).

**This is the single biggest change.** We are replacing `nodemailer` SMTP with the **Cloudflare Email Service** — Cloudflare's native transactional email product, called from the Worker via the **`send_email` binding** (`env.EMAIL.send(...)`). This is fully Workers-compatible, needs no third-party SDK or API key at runtime, and no raw sockets. See **Section 5a** for the full email migration.

---

## 3. Dependency Changes (`package.json`)

**Remove:**
- `@astrojs/netlify`
- `nodemailer` and `@types/nodemailer` (replaced by the Cloudflare Email Service binding)

**Add:**
- `@astrojs/cloudflare` — the Cloudflare adapter (a version compatible with Astro 6).
- `wrangler` (devDependency) — for config, local runtime emulation, and deploys.
- **No email SDK is needed** — the `send_email` binding is provided natively by the Workers runtime. (Optionally add `@cloudflare/workers-types` as a devDependency for typing `env.EMAIL`.)

`dotenv` can stay (used by `scripts/setup-tsconfig.js` and `astro.config.ts` for local builds).

---

## 4. Astro Config Changes (`astro.config.ts`) — mostly done

- ✅ Adapter swapped to `import cloudflare from "@astrojs/cloudflare"` / `adapter: cloudflare()`.
- ✅ Keep `output: "static"` — only `prerender = false` routes become Worker routes.
- ✅ Keep the `@brand` / `@` Vite aliases. Note `astro.config.ts` reads `process.env.PUBLIC_BRAND` **at config load**, so `PUBLIC_BRAND` must exist in the *build* environment (see Section 7).
- ✅ `SMTP_*` dropped from `env.schema`. The Email Service binding is **not** an `astro:env` variable — it is a per-request runtime binding read from `locals.runtime.env.EMAIL`.
- ⚠️ **Still missing:** `EMAIL_ADMIN`. The schema currently declares `ALLOWED_ORIGINS`, `EMAIL_FROM_NAME` and `EMAIL_FROM` only, but Section 6.1 needs an admin recipient. Add it as a server field.
- `access: "secret"` on these fields only tells Astro to read them from the server runtime env rather than inlining them; it does **not** mean they must be stored as Cloudflare secrets. `EMAIL_FROM`, `EMAIL_FROM_NAME`, `EMAIL_ADMIN` and `ALLOWED_ORIGINS` are non-sensitive brand config and are better placed in per-brand `vars` in the wrangler config (Section 5).
- `import.meta.env.DEV` (in `clientIp.ts`) is resolved by Vite at build time, so it is unaffected by the runtime change.

### Why there is no `platformProxy` option any more

The original plan called for `cloudflare({ platformProxy: { enabled: true } })`. **That option no longer exists** — omitting it is correct, and there is nothing to replace it with.

- **What it did:** in the older Pages-era adapter (v9–v11), `astro dev` ran in **Node.js**, not `workerd`. Cloudflare bindings do not exist in Node, so the adapter used Wrangler's `getPlatformProxy()` to stand up a background `workerd` instance and proxy `locals.runtime.env` into the Node dev server. It was opt-in because it added startup cost and only approximated the real runtime.
- **What changed:** `@astrojs/cloudflare` v14 is built on **`@cloudflare/vite-plugin`**, which runs your dev code *inside* `workerd` itself. Bindings, `nodejs_compat` behaviour and `locals.runtime` are the real thing in `astro dev`, so there is no proxy to enable.
- **Verify:** the adapter's `Options` type (`node_modules/@astrojs/cloudflare/dist/index.d.ts`) accepts `imageService`, `sessionKVBindingName`, `imagesBindingName`, `prerenderEnvironment`, `experimental`, plus `configPath`, `remoteBindings`, `persistState`, `auxiliaryWorkers` and `inspectorPort` passed through to the Vite plugin. There is no `platformProxy` key — passing it would be a type error.
- **Two options worth knowing about here:**
  - `configPath` — points the adapter at a non-default wrangler config file.
  - `remoteBindings` — relevant to the email work: see Section 9.

---

## 5. New Cloudflare Config Files

### Is a wrangler config file needed? Yes.

`@astrojs/cloudflare` can auto-generate a default config for a project with no custom requirements. This project has two that rule that out:

1. `compatibility_flags = ["nodejs_compat"]` for Node built-ins still referenced by Astro output.
2. The `send_email` binding — **only** declarable in the wrangler config.

Configuring bindings in the dashboard instead is not a viable alternative: once the Worker is deployed with `wrangler deploy` (which is the default deploy command for Workers Builds), the wrangler config is the source of truth and a deploy overwrites dashboard-side binding edits.

### `wrangler.jsonc` — new file in repo root

Use **one Worker per brand, expressed as a wrangler environment**, so the whitelabel config lives in the repo and is reviewable, rather than being duplicated by hand across N dashboard projects. Wrangler config has **no variable interpolation**; `[env.*]` blocks are the supported mechanism for this.

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "venue-site",
  "main": "@astrojs/cloudflare/entrypoints/server",
  "compatibility_date": "2026-09-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": "./dist", "binding": "ASSETS" },

  "env": {
    "redcow": {
      "vars": {
        "EMAIL_FROM": "bookings@redcow.example",
        "EMAIL_FROM_NAME": "The Red Cow",
        "EMAIL_ADMIN": "manager@redcow.example",
        "ALLOWED_ORIGINS": "https://redcow.example"
      },
      "send_email": [
        { "name": "EMAIL", "allowed_sender_addresses": ["bookings@redcow.example"] }
      ],
      "routes": [{ "pattern": "redcow.example", "custom_domain": true }]
    },

    "<brand-2>": {
      "vars": { "EMAIL_FROM": "…", "EMAIL_FROM_NAME": "…", "EMAIL_ADMIN": "…", "ALLOWED_ORIGINS": "…" },
      "send_email": [{ "name": "EMAIL", "allowed_sender_addresses": ["…"] }],
      "routes": [{ "pattern": "…", "custom_domain": true }]
    }
  }
}
```

**Three rules that bite:**

- **Worker naming.** An environment deploys as `<top-level-name>-<env-name>` — the example above produces `venue-site-redcow`. The docs state an environment cannot fully override `name`, so pick a top-level name that reads well when suffixed. Confirm the real target before wiring anything up:
  ```sh
  npx wrangler deploy --dry-run --env redcow
  ```
- **`vars`, bindings and secrets are non-inheritable.** Nothing falls through from the top level into an environment — every brand block must repeat them in full. Top-level `vars`/`send_email` would apply only to a nameless default deploy.
- **`PUBLIC_BRAND` does not belong here.** It is inlined at build time, and wrangler `vars` are runtime-only. It must be a *build* variable (Section 7).

**Selecting a brand locally:** the Cloudflare Vite plugin reads the `CLOUDFLARE_ENV` environment variable at dev and build time. `CLOUDFLARE_ENV=redcow npm run dev` picks that brand's block. It has no effect on `wrangler deploy`, which uses `--env`.

Confirm the final bundle no longer pulls in `nodemailer` before relying on `nodejs_compat`.

> **Restriction note:** A binding with **no** `destination_address` / `allowed_destination_addresses` can send to any *verified destination address* **before** domain onboarding, and to **any** recipient **after** the sending domain is onboarded. Because the booking flow emails **arbitrary customer addresses** (the confirmation email), the sending domain **must be onboarded** (see Section 5a) — do **not** lock the binding to a fixed `destination_address`. `allowed_sender_addresses` (shown above) constrains the *from* address only and is safe to use.

### 5a. Cloudflare Email Service migration (the email path)

The booking endpoint sends **two** emails: an **admin notification** (fixed internal address) and a **customer confirmation** (arbitrary external address). Both go through the same `send_email` binding.

**One-time setup (per brand / sending domain):**
1. In the Cloudflare dashboard, open **Email Service** and **onboard the sending domain** (add the required SPF/DKIM/DMARC DNS records and verify). The domain **must be on Cloudflare DNS**. This is mandatory to email arbitrary customer addresses — without onboarding you can only send to individually *verified destination addresses*, which is fine for the admin email but **not** for customer confirmations.
2. Ensure the `from` address (`EMAIL_FROM`) belongs to that onboarded domain.
3. Add the `send_email` binding to the brand's environment block in `wrangler.jsonc` (Section 5). There is no dashboard equivalent for this binding.
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
Cloudflare's local equivalent of `.env` for server values during local development. With per-brand `vars` in `wrangler.jsonc` this is now only needed for values that must *not* be committed; use `.dev.vars.<env>` to override a specific brand. See Section 9 for how the email binding behaves locally.

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
- For real distributed rate limiting, back it with **Cloudflare KV** (or the Rate Limiting binding / Durable Objects) and add the binding to **each** brand's `env.<brand>` block in `wrangler.jsonc` — bindings are not inherited from the top level. Optional but recommended for production.

### 6.4 `robots.txt` endpoint
`src/pages/robots.txt.ts` uses only the standard `site` object — no change needed.

---

## 7. Deployment — Workers Builds Git Integration (auto-deploy on push to `main`)

**No GitHub Actions CI/CD.** Cloudflare **Workers Builds** connects each Worker directly to the GitHub repo and builds + deploys on every push to `main`. **Delete `.github/workflow/deploy.yaml`** entirely.

### Setup (per brand)
Create **one Worker per brand**, each connected to the **same repo** with **production branch = `main`**, and each pointed at its own wrangler environment. Under the Worker's **Settings → Build**:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy --env <brand>` |
| Production branch | `main` |
| Build variables | `PUBLIC_BRAND=<brand>`, `PUBLIC_SITE_URL=…`, `NODE_VERSION=20` |

The deploy command's `--env` flag is what makes one repo fan out into N differently-configured Workers. A single push to `main` triggers every connected Worker; each rebuilds with its own `PUBLIC_BRAND` and deploys with its own `vars`, `send_email` binding and routes from `wrangler.jsonc`.

### Where each kind of config lives

- **Build variables (dashboard, per Worker):** `PUBLIC_BRAND`, `PUBLIC_SITE_URL`, `NODE_VERSION`. These are build-only and are **not** available at runtime — which is correct, since Astro inlines `PUBLIC_*` into the bundle. They cannot come from wrangler `vars`.
- **Runtime vars (`wrangler.jsonc`, per environment):** `EMAIL_FROM`, `EMAIL_FROM_NAME`, `EMAIL_ADMIN`, `ALLOWED_ORIGINS`. Non-sensitive brand config, better in the repo than duplicated across dashboards.
- **Bindings (`wrangler.jsonc`, per environment):** `send_email` as `EMAIL`.
- **Secrets (dashboard or `wrangler secret put --env <brand>`):** none required today. Anything genuinely sensitive added later goes here, never in `wrangler.jsonc`.

### Whitelabel theming without the workflow
The old `.github/workflow/deploy.yaml` did two brand steps that must now be handled by the build itself:

1. **`sed` replace of `redcow` → brand:** **Not needed for correctness.** Brand selection is already driven by `PUBLIC_BRAND` at build time (`astro.config.ts` `@brand` alias, `scripts/setup-tsconfig.js`, and `src/libs/utils/routing.ts`). The only literal `redcow` occurrences in `src/` are inside the `redcow` **brand asset folder** itself (`src/assets/redcow/content/data.ts`) plus one code comment — each brand has its own `src/assets/<brand>/content/data.ts`, so no cross-file string replacement is required. The `sed` step can be dropped.
2. **Pruning non-target brand asset folders:** This was a **bundle-size** optimisation, not correctness. Note that `src/libs/utils/routing.ts` uses `import.meta.glob('/src/assets/*/images/*', { eager: true })`, which eagerly bundles **every** brand's images into **every** build. With Git-integration builds (no prune step), each brand deploy would ship all brands' images — and on Workers this counts against the Worker size limit, so it matters more than it did on Netlify. **Recommended fix:** scope the glob to the active brand so pruning is unnecessary, e.g. build the glob path from `PUBLIC_BRAND` (or filter the glob result to keys starting with `/src/assets/${brand}/`). If that refactor is deferred, add a `prebuild` npm script that removes other `src/assets/*` folders based on `PUBLIC_BRAND` before `astro build`.

### Preview deployments (optional)
Workers Builds can build non-production branches too. Set the Worker's **non-production branch deploy command** to `npx wrangler versions upload --env <brand>`, which uploads a new version and returns a preview URL without promoting it to production. Confirm the behaviour on the first PR before relying on it.

### First-deploy prerequisites
Before the first push-to-deploy: the sending domain must be **onboarded in Email Service** (Section 5a), and each brand's environment block must carry its `send_email` binding and `EMAIL_*` vars, otherwise the booking endpoint's emails will fail at runtime.

---

## 8. Environment Variables Mapping

| Variable | Type | Where it is set | Read by |
|----------|------|-----------------|---------|
| `PUBLIC_BRAND` | build-time | Worker → Settings → Build → **build variables** (per brand) | `astro.config.ts` (`process.env`), `astro:env/client` |
| `PUBLIC_SITE_URL` | build-time | Worker → Settings → Build → **build variables** (per brand) | `astro.config.ts` (`site`), `astro:env/client` |
| `ALLOWED_ORIGINS` | runtime | `wrangler.jsonc` → `env.<brand>.vars` | `astro:env/server` |
| `EMAIL_FROM`, `EMAIL_FROM_NAME`, `EMAIL_ADMIN` | runtime | `wrangler.jsonc` → `env.<brand>.vars` (`EMAIL_FROM` must be on the onboarded domain) | `astro:env/server` |
| `EMAIL` (send_email binding) | runtime binding | `wrangler.jsonc` → `env.<brand>.send_email` — **no dashboard option** | `locals.runtime.env.EMAIL` (not `astro:env`) |
| *(future secrets)* | runtime secret | `npx wrangler secret put <NAME> --env <brand>` or dashboard | `astro:env/server` |
| ~~`SMTP_HOST/PORT/SECURE/USER/PASS/FROM_NAME/FROM_EMAIL/ADMIN_EMAIL`~~ | removed | — | replaced by the `send_email` binding + `EMAIL_*` addressing vars |

Two directions the wires cannot cross:

- `PUBLIC_*` values are **inlined into the bundle at build time**, so they must exist in the *build* environment. Wrangler `vars` are runtime-only and arrive too late.
- Build variables are **not** available at runtime, so the `EMAIL_*` / `ALLOWED_ORIGINS` values cannot be set there.

Locally, `CLOUDFLARE_ENV=<brand>` selects the wrangler environment, and `PUBLIC_BRAND` comes from `.env` via `dotenv` as it does today.

---

## 9. Local Development

- `npm run dev` runs inside `workerd` via `@cloudflare/vite-plugin` — bindings and `locals.runtime` are real, so the booking endpoint can be exercised without a separate `wrangler dev` step. (This is what replaced `platformProxy`; see Section 4.)
- Select the brand with `CLOUDFLARE_ENV=<brand> npm run dev`, alongside the `PUBLIC_BRAND` your `.env` already provides. Keep the two in sync or the site will render one brand while emailing as another.
- ⚠️ **Email is not emulated.** Cloudflare's docs state that local development against Email Service uses **remote bindings** — the mail is genuinely delivered, not logged. Consequences:
  - Mark the binding `"remote": true` for local use, and note the adapter exposes a `remoteBindings` option (Section 4). Verify the exact wiring on first run.
  - Use a throwaway recipient while testing the customer confirmation path. There is no dry-run mode.
- `.dev.vars` (or `.dev.vars.<brand>`) overrides runtime values locally for anything you do not want committed.

---

## 10. Step-by-Step Checklist

1. [ ] Onboard the sending domain in **Cloudflare Email Service** (domain on Cloudflare DNS + SPF/DKIM/DMARC + verify) so customer confirmations to arbitrary addresses are allowed.
2. [x] `npm remove @astrojs/netlify`.
3. [x] `npm install @astrojs/cloudflare` and `npm install -D wrangler @cloudflare/workers-types`.
4. [ ] `npm remove nodemailer @types/nodemailer` (once Section 6.1 lands — `@types/nodemailer` is still in `package.json`).
5. [x] Update `astro.config.ts` adapter and drop `SMTP_*` from the `astro:env` schema. **Remaining:** add `EMAIL_ADMIN` (Section 4).
6. [ ] Add `wrangler.jsonc` with `main`, `assets`, `nodejs_compat`, and one `env.<brand>` block per brand carrying `vars`, `send_email` and `routes` (Section 5). Check the resulting Worker name with `npx wrangler deploy --dry-run --env <brand>`.
7. [ ] Rewrite email libs to `env.EMAIL.send(...)`; pass the binding from `locals.runtime.env` through the helpers; keep HTML generation.
8. [ ] Update `clientIp.ts` to prefer `cf-connecting-ip`; remove top-level `setInterval` in `rateLimiter.ts`.
9. [ ] Update `.gitignore` (`.wrangler/`, `.dev.vars*`; drop `.netlify/`).
10. [ ] Scope the `import.meta.glob` in `routing.ts` to the active brand (Section 7) so each Worker ships only its own images.
11. [ ] **Delete `.github/workflow/deploy.yaml`.**
12. [ ] Create one **Worker per brand** in Workers Builds, all on the same repo and `main`: build `npm run build`, deploy `npx wrangler deploy --env <brand>`, build variables `PUBLIC_BRAND` / `PUBLIC_SITE_URL` / `NODE_VERSION` (Section 7).
13. [ ] `CLOUDFLARE_ENV=<brand> npm run dev` to smoke-test the booking endpoint + emails — **using a throwaway recipient**, since local email sends for real (Section 9).
14. [ ] Deploy, verify: static pages, booking POST, **admin + customer email delivery**, `robots.txt`, sitemap, and per-brand assets/menus.
15. [ ] Update `README.md` with Cloudflare deploy/dev instructions.

---

## 11. Risk / Effort Summary

| Item | Effort | Risk |
|------|--------|------|
| Adapter swap + `wrangler.jsonc` with per-brand environments | Low | Low |
| Email migration (nodemailer → Cloudflare Email Service `send_email` binding) | **Medium** | **Medium** (domain onboarding + deliverability + arbitrary-recipient rule + local sends are real) |
| Deployment via Workers Builds (delete GH Actions workflow) | Low | Low |
| Whitelabel: scope image glob to active brand (replaces prune step) | Low–Medium | Medium (bundle size / build config per brand) |
| Rate limiter runtime fix (+ optional KV) | Low (Medium if KV) | Low |
| Client IP header reorder | Low | Low |
| Whitelabel build env wiring | Low | Medium (must set `PUBLIC_BRAND` per brand build) |

**Biggest risk:** the email path. The main gotcha is that Cloudflare Email Service only allows sending to **arbitrary recipients after the sending domain is onboarded** — until then it is limited to verified destination addresses, which would silently break the **customer confirmation** email. Onboard the domain first and test both emails on the Workers runtime early. Everything else is mechanical.
