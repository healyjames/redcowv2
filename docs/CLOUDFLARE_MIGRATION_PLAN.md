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

- ✅ Adapter swapped to `import cloudflare from "@astrojs/cloudflare"`, with `configPath` pointing at the active brand's wrangler config (Section 5).
- ✅ Keep `output: "static"` — only `prerender = false` routes become Worker routes.
- ✅ Keep the `@brand` / `@` Vite aliases. Note `astro.config.ts` reads `process.env.PUBLIC_BRAND` **at config load**, so `PUBLIC_BRAND` must exist in the *build* environment (see Section 7).
- ✅ `SMTP_*` dropped from `env.schema`. The Email Service binding is **not** an `astro:env` variable — it is a per-request runtime binding read from `locals.runtime.env.EMAIL`.
- ✅ `EMAIL_ADMIN` added as a server field, alongside `ALLOWED_ORIGINS`, `EMAIL_FROM_NAME` and `EMAIL_FROM`.
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

### `src/assets/<brand>/wrangler.jsonc` — one per brand

Use **one config file per brand**, living alongside that brand's other assets, each a standalone Worker definition. Wrangler config has **no variable interpolation**, so the brand list is an explicit set of files rather than anything computed. Keeping it in the brand folder means everything brand-specific — content, images, menus, fonts, and now infrastructure — sits in one directory.

The live example is `src/assets/redcow/wrangler.jsonc`:

```jsonc
{
  "$schema": "../../../node_modules/wrangler/config-schema.json",
  "name": "redcow",
  "compatibility_date": "2026-09-01",
  "compatibility_flags": ["nodejs_compat"],
  "vars": {
    "EMAIL_FROM": "info@redcownantwich.co.uk",
    "EMAIL_FROM_NAME": "The Red Cow",
    "EMAIL_ADMIN": "info@redcownantwich.co.uk",
    "ALLOWED_ORIGINS": "https://redcownantwich.co.uk"
  },
  "send_email": [
    { "name": "EMAIL", "allowed_sender_addresses": ["info@redcownantwich.co.uk"] }
  ],
  "routes": [{ "pattern": "redcownantwich.co.uk", "custom_domain": true }]
}
```

**Why per-file rather than `[env.*]` blocks:** a wrangler *environment* deploys as `<top-level-name>-<env-name>`, so `env.redcow` would produce a Worker called `venue-site-redcow`, not `redcow`. Separate files give each brand its own top-level `name`, and sidestep the rule that `vars` and bindings are non-inheritable across environments. The cost is repeating `compatibility_date` / `compatibility_flags` per file.

**One variable drives everything.** `astro.config.ts` already reads `PUBLIC_BRAND`, and now passes it to the adapter:

```ts
adapter: cloudflare({
    configPath: `./src/assets/${brand}/wrangler.jsonc`,
}),
```

So `PUBLIC_BRAND` selects the asset alias, the tsconfig/menu setup, *and* the Worker config — no second `CLOUDFLARE_ENV` variable to keep in sync.

> ⚠️ **`configPath` must be a relative path.** The adapter resolves it with `new URL(configPath, config.root)` (`dist/index.js` ~line 332). On Windows an absolute path such as `C:\…` from `path.resolve()` is parsed as URL scheme `c:` and the build dies with *"The URL must be of scheme file"* during the `astro:config:setup` hook. Use forward slashes and a leading `./`.

**Why a non-root location is safe here:** wrangler resolves relative paths *inside* a config file against that file's own directory, but this config has none — `main` is a bare package specifier injected by the adapter, and there is no `assets.directory`. The only path that needed adjusting was `$schema`.

**Do not hand-write `main` or `assets`.** Verified in `node_modules/@astrojs/cloudflare/dist/wrangler.js`: the adapter's config customizer fills in `main: "@astrojs/cloudflare/entrypoints/server"`, `assets.binding: "ASSETS"`, a default `compatibility_date`, a `SESSION` KV binding and an `IMAGES` binding whenever they are absent, and appends `nodejs_als` unless an ALS-capable flag (`nodejs_compat` counts) is already present. Duplicating those by hand just risks drift.

Consequence: a brand config is **not independently deployable** as written — the auto-filled fields are injected by the Vite plugin at build time, so `wrangler deploy --dry-run -c src/assets/redcow/wrangler.jsonc` alone fails with *"Missing entry-point to Worker script or to assets directory"*.

**✅ Resolved — the deploy command is:**

```sh
npx wrangler deploy -c dist/server/wrangler.json
```

The build writes a fully-resolved config to `dist/server/wrangler.json`, merging the brand file with the adapter's injected fields (`main: "entry.mjs"`, `assets.directory: "../client"`, the `SESSION` KV and `IMAGES` bindings). The path is the same for every brand, because `configPath` already selected the brand at build time. Verified by dry-run: `name: "redcow"`, route `redcownantwich.co.uk`, and bindings `SESSION`, `EMAIL`, `IMAGES`, `ASSETS` plus the four vars.

**Validating a brand file** without a full build — supply throwaway assets to satisfy the entry-point check:

```sh
npx wrangler deploy --dry-run -c src/assets/redcow/wrangler.jsonc --assets ./public
```

This prints the resolved bindings; `src/assets/redcow/wrangler.jsonc` has been confirmed to produce `env.EMAIL` (Send Email, senders restricted to `info@redcownantwich.co.uk`) plus the four `vars`.

**`PUBLIC_BRAND` does not belong in this file.** It is inlined at build time, and wrangler `vars` are runtime-only. It must be a *build* variable (Section 7).

Confirm the final bundle no longer pulls in `nodemailer` before relying on `nodejs_compat`.

### Adding a brand

1. Copy `src/assets/redcow/wrangler.jsonc` → `src/assets/<brand>/wrangler.jsonc`; set `name`, `vars`, `allowed_sender_addresses` and `routes`.
2. Onboard that brand's sending domain in Email Service (Section 5a).
3. Create a Worker in Workers Builds with build variable `PUBLIC_BRAND=<brand>` (Section 7).

> **Restriction note:** A binding with **no** `destination_address` / `allowed_destination_addresses` can send to any *verified destination address* **before** domain onboarding, and to **any** recipient **after** the sending domain is onboarded. Because the booking flow emails **arbitrary customer addresses** (the confirmation email), the sending domain **must be onboarded** (see Section 5a) — do **not** lock the binding to a fixed `destination_address`. `allowed_sender_addresses` (shown above) constrains the *from* address only and is safe to use.

### 5a. Cloudflare Email Service migration (the email path)

The booking endpoint sends **two** emails: an **admin notification** (fixed internal address) and a **customer confirmation** (arbitrary external address). Both go through the same `send_email` binding.

**One-time setup (per brand / sending domain):**
1. In the Cloudflare dashboard, open **Email Service** and **onboard the sending domain** (add the required SPF/DKIM/DMARC DNS records and verify). The domain **must be on Cloudflare DNS**. This is mandatory to email arbitrary customer addresses — without onboarding you can only send to individually *verified destination addresses*, which is fine for the admin email but **not** for customer confirmations.
2. Ensure the `from` address (`EMAIL_FROM`) belongs to that onboarded domain.
3. Add the `send_email` binding to that brand's `src/assets/<brand>/wrangler.jsonc` (Section 5). There is no dashboard equivalent for this binding.
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

### `.gitignore` — ✅ done
`.netlify/` replaced with `.wrangler/`, `.dev.vars`, `src/assets/*/.dev.vars` and the generated `src/worker-configuration.d.ts`. Also added `public/menus/`, which `npm run setup` generates from the active brand and was previously neither tracked nor ignored. `.env.example` and `.dev.vars.example` are committed as templates.

### `.dev.vars` (local overrides, git-ignored)

> ⚠️ **It must live beside the wrangler config: `src/assets/<brand>/.dev.vars`.** Wrangler resolves `.dev.vars` relative to the config file, and the config now lives in the brand folder. A copy at the repo root is **silently ignored** — verified: the booking endpoint still returned `403 Invalid origin` with a root `.dev.vars`, and only started working once the file was moved next to `wrangler.jsonc`.

**Local dev needs one.** `ALLOWED_ORIGINS` is committed as the brand's *production* domain, so without an override the booking endpoint rejects `http://localhost:4321` with `403 Invalid origin`. This is a behaviour change from the Netlify setup, where the value came from `.env`. `.dev.vars.example` at the repo root is the template; copy it into the brand folder.

---

## 6. Code Changes

### 6.1 Email sending — ✅ done

- `src/libs/email/transport.ts` now exports a single `sendEmail({ mailer, to, subject, html, text, replyTo })` helper that calls `mailer.send(...)` and applies the `from` address from `EMAIL_FROM_NAME` / `EMAIL_FROM`. The binding's `from` accepts an `EmailAddress` object (`{ name, email }`), so no `"Name" <addr>` string assembly is needed.
- `sendAdminBookingEmail` and `sendCustomerConfirmation` take an options object containing the `mailer` binding and the booking `data`, and delegate to `sendEmail`.
- `sendEmailWithSmtp.ts` was **deleted** — it was unreferenced dead code duplicating `sendAdminBookingEmail` via nodemailer.
- `generateEmailHtml` and the `templates/*` HTML builders are unchanged.
- `nodemailer` and `@types/nodemailer` removed from `package.json`; `dist/` confirmed free of any nodemailer reference.

> ⚠️ **`Astro.locals.runtime.env` no longer exists.** The plan originally specified it, but in `@astrojs/cloudflare` v14 `Runtime` is typed as `{ cfContext: ExecutionContext }` and `locals.runtime.env` is a getter that **throws**: *"Astro.locals.runtime.env has been removed in Astro v6. Use `import { env } from "cloudflare:workers"` instead."* (`dist/utils/cf-helpers.js`). The booking route therefore does:
> ```ts
> import { env } from "cloudflare:workers";
> ...
> const mailer = env.EMAIL;
> ```
> Because `env` is available at module scope, threading the binding through arguments is no longer *required* — it is kept because it leaves the helpers pure and testable.

**Typing the binding.** `env` is typed by a global `Env` interface that `wrangler types` generates. `npm run setup` now regenerates `src/worker-configuration.d.ts` from the active brand's wrangler config (via `scripts/setup-tsconfig.js`), so `env.EMAIL` is `SendEmail` and the four `vars` are typed literals. The file is git-ignored — it is brand-specific and derived.

**Error handling** stays in the booking route, which already wraps both sends in `try/catch` and re-throws as a 500.

### 6.2 Client IP — ✅ done
`src/libs/utils/clientIp.ts` now reads **`cf-connecting-ip`** first; the Netlify `x-nf-client-connection-ip` header has been removed.

### 6.3 Rate limiter — ✅ done
`src/libs/utils/rateLimiter.ts` uses a module-level `Map`. On the Workers runtime global state is per-isolate and non-durable, so limits are best-effort only (this was already true on Netlify Functions).
- The top-level `setInterval` has been removed in favour of a `pruneExpired(now)` pass inside `checkRateLimit`.
- Entries are now replaced rather than mutated in place.
- For real distributed rate limiting, back it with **Cloudflare KV** (or the Rate Limiting binding / Durable Objects) and add the binding to **every** `src/assets/<brand>/wrangler.jsonc`. Optional but recommended for production.

### 6.4 `robots.txt` endpoint
`src/pages/robots.txt.ts` uses only the standard `site` object — no change needed.

---

## 7. Deployment — Workers Builds Git Integration (auto-deploy on push to `main`)

**No GitHub Actions CI/CD.** Cloudflare **Workers Builds** connects each Worker directly to the GitHub repo and builds + deploys on every push to `main`. **Delete `.github/workflow/deploy.yaml`** entirely.

### Setup (per brand)
Create **one Worker per brand**, each connected to the **same repo** with **production branch = `main`**. Under the Worker's **Settings → Build**:

| Setting | Value (for `redcow`) |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy -c dist/server/wrangler.json` (same for every brand) |
| Production branch | `main` |
| Build variables | `PUBLIC_BRAND=redcow`, `PUBLIC_SITE_URL=https://redcownantwich.co.uk`, `NODE_VERSION=20` |

`PUBLIC_BRAND` is the only thing that differs structurally: it selects the brand assets at build time *and*, via `configPath` in `astro.config.ts`, the matching `src/assets/<brand>/wrangler.jsonc`. A single push to `main` triggers every connected Worker; each rebuilds for its own brand and deploys with its own `vars`, `send_email` binding and route.

### Where each kind of config lives

- **Build variables (dashboard, per Worker):** `PUBLIC_BRAND`, `PUBLIC_SITE_URL`, `NODE_VERSION`. These are build-only and are **not** available at runtime — which is correct, since Astro inlines `PUBLIC_*` into the bundle. They cannot come from wrangler `vars`.
- **Runtime vars (`src/assets/<brand>/wrangler.jsonc`):** `EMAIL_FROM`, `EMAIL_FROM_NAME`, `EMAIL_ADMIN`, `ALLOWED_ORIGINS`. Non-sensitive brand config, better in the repo than duplicated across dashboards.
- **Bindings (`src/assets/<brand>/wrangler.jsonc`):** `send_email` as `EMAIL`.
- **Secrets (dashboard or `wrangler secret put -c src/assets/<brand>/wrangler.jsonc`):** none required today. Anything genuinely sensitive added later goes here, never in the committed config.

### Whitelabel theming without the workflow
The old `.github/workflow/deploy.yaml` did two brand steps that must now be handled by the build itself:

1. **`sed` replace of `redcow` → brand:** **Not needed for correctness.** Brand selection is already driven by `PUBLIC_BRAND` at build time (`astro.config.ts` `@brand` alias, `scripts/setup-tsconfig.js`, and `src/libs/utils/routing.ts`). The only literal `redcow` occurrences in `src/` are inside the `redcow` **brand asset folder** itself (`src/assets/redcow/content/data.ts`) plus one code comment — each brand has its own `src/assets/<brand>/content/data.ts`, so no cross-file string replacement is required. The `sed` step can be dropped.
2. **Pruning non-target brand asset folders — ✅ no longer needed.** `src/libs/utils/routing.ts` used `import.meta.glob('/src/assets/*/images/*', { eager: true })`, whose `*` in the brand position matched **every** brand. Eager globs emit every matched file as a static asset regardless of whether any page renders it, so each brand's deploy shipped all brands' images — confirmed in a real build as 10 duplicated basenames in `dist/client/_astro`. These are static assets, not Worker script, so this was never a size-limit problem: the defect was that **each brand's domain publicly served every other brand's imagery**, breaking the whitelabel boundary.

   **Fix applied:** the glob now uses the `@brand` Vite alias, which `astro.config.ts` already resolves from `PUBLIC_BRAND`:

   ```ts
   import.meta.glob('@brand/images/*.{jpg,jpeg,png,webp,avif}', { eager: true })
   ```

   Vite supports alias paths in glob patterns, and this works under Astro 7's rolldown-vite (verified by build and by dev server). Lookups go through a basename→`ImageMetadata` map so the code does not depend on the shape of alias-resolved glob keys. `routing.ts` no longer imports `PUBLIC_BRAND` from `astro:env/client` at all — brand selection is now purely the build-time alias. A `prebuild` prune step is unnecessary.

### Preview deployments (optional)
Workers Builds can build non-production branches too. Set the Worker's **non-production branch deploy command** to `npx wrangler versions upload -c src/assets/<brand>/wrangler.jsonc`, which uploads a new version and returns a preview URL without promoting it to production. Confirm the behaviour on the first PR before relying on it.

### First-deploy prerequisites
Before the first push-to-deploy: the sending domain must be **onboarded in Email Service** (Section 5a), and each brand's environment block must carry its `send_email` binding and `EMAIL_*` vars, otherwise the booking endpoint's emails will fail at runtime.

---

## 8. Environment Variables Mapping

| Variable | Type | Where it is set | Read by |
|----------|------|-----------------|---------|
| `PUBLIC_BRAND` | build-time | Worker → Settings → Build → **build variables** (per brand) | `astro.config.ts` (`process.env`), `astro:env/client` |
| `PUBLIC_SITE_URL` | build-time | Worker → Settings → Build → **build variables** (per brand) | `astro.config.ts` (`site`), `astro:env/client` |
| `ALLOWED_ORIGINS` | runtime | `src/assets/<brand>/wrangler.jsonc` → `vars` | `astro:env/server` |
| `EMAIL_FROM`, `EMAIL_FROM_NAME`, `EMAIL_ADMIN` | runtime | `src/assets/<brand>/wrangler.jsonc` → `vars` (`EMAIL_FROM` must be on the onboarded domain) | `astro:env/server` |
| `EMAIL` (send_email binding) | runtime binding | `src/assets/<brand>/wrangler.jsonc` → `send_email` — **no dashboard option** | `locals.runtime.env.EMAIL` (not `astro:env`) |
| *(future secrets)* | runtime secret | `npx wrangler secret put <NAME> -c src/assets/<brand>/wrangler.jsonc` or dashboard | `astro:env/server` |
| ~~`SMTP_HOST/PORT/SECURE/USER/PASS/FROM_NAME/FROM_EMAIL/ADMIN_EMAIL`~~ | removed | — | replaced by the `send_email` binding + `EMAIL_*` addressing vars |

Two directions the wires cannot cross:

- `PUBLIC_*` values are **inlined into the bundle at build time**, so they must exist in the *build* environment. Wrangler `vars` are runtime-only and arrive too late.
- Build variables are **not** available at runtime, so the `EMAIL_*` / `ALLOWED_ORIGINS` values cannot be set there.

Locally, `PUBLIC_BRAND` in `.env` selects everything — brand assets *and* the wrangler config, via `configPath` in `astro.config.ts`. There is no second brand variable.

---

## 9. Local Development

- `npm run dev` runs inside `workerd` via `@cloudflare/vite-plugin` — bindings and `locals.runtime` are real, so the booking endpoint can be exercised without a separate `wrangler dev` step. (This is what replaced `platformProxy`; see Section 4.)
- The brand comes from `PUBLIC_BRAND` in `.env` — it picks the assets *and* the `src/assets/<brand>/wrangler.jsonc` the dev runtime loads. Nothing else to set.
- ⚠️ **Email is not emulated.** Cloudflare's docs state that local development against Email Service uses **remote bindings** — the mail is genuinely delivered, not logged. Consequences:
  - Mark the binding `"remote": true` for local use, and note the adapter exposes a `remoteBindings` option (Section 4). Verify the exact wiring on first run.
  - Use a throwaway recipient while testing the customer confirmation path. There is no dry-run mode.
- `src/assets/<brand>/.dev.vars` overrides runtime values locally — **required** for the booking endpoint to accept localhost origins (Section 5). Not the repo root; see the warning there.

---

## 10. Step-by-Step Checklist

1. [ ] Onboard the sending domain in **Cloudflare Email Service** (domain on Cloudflare DNS + SPF/DKIM/DMARC + verify) so customer confirmations to arbitrary addresses are allowed.
2. [x] `npm remove @astrojs/netlify`.
3. [x] `npm install @astrojs/cloudflare` and `npm install -D wrangler @cloudflare/workers-types`.
4. [x] `npm remove nodemailer @types/nodemailer`.
5. [x] Update `astro.config.ts`: adapter + `configPath`, `SMTP_*` dropped from the `astro:env` schema, `EMAIL_ADMIN` added.
6. [x] Add `src/assets/redcow/wrangler.jsonc` (`nodejs_compat`, `vars`, `send_email`, `routes`) and wire `configPath` in `astro.config.ts` — bindings verified with `npx wrangler deploy --dry-run -c src/assets/redcow/wrangler.jsonc --assets ./public`, and config resolution verified by running the build.
7. [x] Rewrite email libs to `mailer.send(...)` with the binding from `cloudflare:workers`; keep HTML generation. Build and `astro check` both clean.
8. [x] Replace `SMTP_FROM_NAME` in `src/layouts/base.astro` with `businessInfo.name` from `@brand/content/data`.
9. [x] Update `clientIp.ts` to prefer `cf-connecting-ip`; remove top-level `setInterval` in `rateLimiter.ts`.
10. [x] Update `.gitignore` (`.wrangler/`, `.dev.vars*`; dropped `.netlify/`).
11. [x] Scope the `import.meta.glob` in `routing.ts` to the active brand via the `@brand` alias (Section 7) — verified: only the active brand's images ship, and no cross-brand paths appear in dev or build output.
12. [x] **Delete `.github/workflow/deploy.yaml`** (done in commit e32ba76).
13. [ ] Create one **Worker per brand** in Workers Builds: build `npm run build`, deploy `npx wrangler deploy -c dist/server/wrangler.json`, build variables `PUBLIC_BRAND` / `PUBLIC_SITE_URL` / `NODE_VERSION` (Section 7).
14. [ ] `npm run dev` to smoke-test the booking endpoint + emails — **using a throwaway recipient**, since local email sends for real (Section 9).
15. [ ] Deploy, verify: static pages, booking POST, **admin + customer email delivery**, `robots.txt`, sitemap, and per-brand assets/menus.
16. [x] Update `README.md` with Cloudflare deploy/dev instructions; add `.env.example` and `.dev.vars.example`.

---

## 11. Risk / Effort Summary

| Item | Effort | Risk |
|------|--------|------|
| Adapter swap + per-brand `src/assets/<brand>/wrangler.jsonc` | Low | Low |
| Email migration (nodemailer → Cloudflare Email Service `send_email` binding) | **Medium** | **Medium** (domain onboarding + deliverability + arbitrary-recipient rule + local sends are real) |
| Deployment via Workers Builds (delete GH Actions workflow) | Low | Low |
| Whitelabel: scope image glob to active brand (replaces prune step) | Low–Medium | Medium (bundle size / build config per brand) |
| Rate limiter runtime fix (+ optional KV) | Low (Medium if KV) | Low |
| Client IP header reorder | Low | Low |
| Whitelabel build env wiring | Low | Medium (must set `PUBLIC_BRAND` per brand build) |

**Biggest risk:** the email path. The main gotcha is that Cloudflare Email Service only allows sending to **arbitrary recipients after the sending domain is onboarded** — until then it is limited to verified destination addresses, which would silently break the **customer confirmation** email. Onboard the domain first and test both emails on the Workers runtime early. Everything else is mechanical.
