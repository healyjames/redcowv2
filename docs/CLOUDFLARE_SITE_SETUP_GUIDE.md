# Cloudflare Pages — Whitelabel Site Setup Guide

How to stand up a new brand site on Cloudflare Pages from this single codebase, and how every brand keeps receiving updates from pushes to `main`. This is repeatable — follow **Part 2 and Part 3 once per brand**.

> Companion doc: `CLOUDFLARE_MIGRATION_PLAN.md` covers the one-time platform migration (adapter, email, config). This guide is the day-to-day "add a site" runbook.

---

## The model in one picture

```
                 one Git repo (this codebase)  ──  branch: main
                 all brand assets live in src/assets/<brand>/
                                   │
              push to main ────────┼──────────────────────────────
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
 Pages project: redcow     Pages project: brandB      Pages project: brandC
 PUBLIC_BRAND=redcow       PUBLIC_BRAND=brandB        PUBLIC_BRAND=brandC
 domain: redcow.co.uk      domain: brandb.com         domain: brandc.com
```

- **One repository, one `main` branch.** All brands share the same code.
- **One Cloudflare Pages project per brand/domain.** Each project is the *same repo* built with a different `PUBLIC_BRAND`.
- **A push to `main` rebuilds every brand project automatically** — each produces its own brand-specific site on its own domain (see Part 4).

---

## Part 1 — Brand assets must exist in the codebase

A brand only works if its asset folder exists at `src/assets/<brand>/`. The brand is selected at build time by the `PUBLIC_BRAND` environment variable, which the code resolves through the `@brand` alias (`@brand → src/assets/${PUBLIC_BRAND}`).

### Required folder structure (copy an existing brand as a template)

```
src/assets/<brand>/
├── content/        # data.ts — text, nav, contact, opening hours, rooms, social links
├── styles/         # theme.css (brand colours / fonts)
├── logo/           # black.svg, emblem.svg (referenced by name)
├── images/         # hero/section images (jpg|jpeg|png|webp|avif)
├── fonts/          # brand fonts
├── menus/          # *.pdf — copied to /public/menus at build
└── favicon.svg
```

The repo already contains a `whitelabel` folder that serves as the template. To add a brand:

```powershell
Copy-Item -Recurse src\assets\whitelabel src\assets\<brand>
# then edit content/data.ts, styles/theme.css, logo/*, images/*, menus/*, favicon.svg
```

### What resolves per-brand automatically
- `@brand/content`, `@brand/styles/theme.css`, `@brand/logo/*`, `@brand/favicon.svg` → resolve to the **active brand only**.
- `menus/*.pdf` → `scripts/setup-tsconfig.js` copies **only the active brand's** menus into `public/menus` during `npm run build`.
- `import.meta.glob(...images...)` in `src/libs/utils/routing.ts` currently bundles **all** brands' images. Preferably scope this to the active brand (see the migration plan) so a brand build only ships its own images.

### Commit the assets
The new `src/assets/<brand>/` must be committed to `main` **before** its Cloudflare project can build successfully.

---

## Part 2 — Create a Cloudflare Pages project for a new site (repeatable)

Do this once per brand. Two ways: **Dashboard** (simplest) or **Wrangler CLI** (scriptable).

### Option A — Dashboard
1. **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.**
2. Select this repository. Authorise Cloudflare's GitHub app if prompted.
3. **Project name:** use the brand, e.g. `redcow` (this also becomes the default `*.pages.dev` subdomain).
4. **Production branch:** `main`.
5. **Build settings:**
   - Framework preset: **Astro** (or "None").
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Add **environment variables and bindings** (Part 3) — do this before the first build, or the booking endpoint will fail.
7. **Save and Deploy.** The first build runs immediately; subsequent builds trigger on every push to `main`.

### Option B — Wrangler CLI (repeatable / scriptable)
```powershell
# one-time
npm install -D wrangler
npx wrangler login

# per brand
npx wrangler pages project create <brand> --production-branch main
```
Then connect the Git repo and set build settings/vars in the dashboard (Git integration + build config is configured via the dashboard even when the project is created via CLI). Bindings can live in `wrangler.toml` (committed) so they apply to every project automatically.

> **Repeating for N brands:** the steps are identical — only the **project name**, **`PUBLIC_BRAND`**, **`PUBLIC_SITE_URL`**, **custom domain**, and **email `from`/sending domain** differ. Everything else (repo, branch, build command, output dir, `wrangler.toml` bindings) is the same.

---

## Part 3 — Environment variables & bindings (per project)

Set these on each Pages project under **Settings → Environment variables** (and **Settings → Functions → Bindings** for the binding). Set them for the **Production** environment (and Preview too if you want working preview deploys).

### Build-time variables (inlined into the static build — must be set at build time)
| Variable | Example | Purpose |
|----------|---------|---------|
| `PUBLIC_BRAND` | `redcow` | Selects `src/assets/<brand>`; drives `@brand` alias, `setup-tsconfig.js`, image resolution. **Different per project.** |
| `PUBLIC_SITE_URL` | `https://redcow.co.uk` | Canonical site URL (sitemap, robots, absolute links). **Different per project.** |
| `NODE_VERSION` | `20` | Pins the build Node version. |

### Runtime variables (available to the booking Function)
| Variable | Example | Purpose |
|----------|---------|---------|
| `ALLOWED_ORIGINS` | `https://redcow.co.uk` | CORS/origin allowlist for the booking API. **Different per project.** |
| `EMAIL_FROM` | `bookings@redcow.co.uk` | Sender address — **must belong to the brand's onboarded Email Service domain** (Part 5). |
| `EMAIL_FROM_NAME` | `Red Cow` | Display name on outgoing email. |
| `EMAIL_ADMIN` | `manager@redcow.co.uk` | Where the admin booking notification is sent. |

Mark anything sensitive as a **Secret** (encrypted) rather than plaintext.

### Binding (per project)
| Binding | Name | Purpose |
|---------|------|---------|
| **Send email** (`send_email`) | `EMAIL` | Cloudflare Email Service binding used by the booking endpoint (`locals.runtime.env.EMAIL.send(...)`). |

If declared in the committed `wrangler.toml`, the `send_email` binding applies to all projects automatically:
```toml
[[send_email]]
name = "EMAIL"
```

---

## Part 4 — How every domain gets updates from one codebase + push to `main`

This is the core of the whitelabel model:

1. Every brand project is connected to the **same repository** with **production branch `main`**.
2. When you push (or merge a PR) to `main`, Cloudflare's Git integration triggers a **new production build for *each* connected project simultaneously**.
3. Each project rebuilds with **its own `PUBLIC_BRAND`**, producing that brand's site, and deploys it to **its own custom domain**.

So a single code change — a shared component fix, a new feature — ships to **all brands at once** on the next push to `main`. A change scoped to one brand's `src/assets/<brand>/` still triggers all projects to rebuild, but only that brand's output changes.

**Rollout / rollback:**
- Each project keeps its own deployment history; you can **roll back an individual brand** in its project's Deployments tab without affecting others.
- Preview deployments are created for non-`main` branches / PRs, letting you validate a change per brand before it reaches `main`.

**Trade-off to be aware of:** every push rebuilds *all* projects. With a small number of brands this is fine. If you later have many brands or need to rebuild only the ones that changed, move to a GitHub Actions matrix that runs `wrangler pages deploy` selectively (covered as an option in the migration plan) — the hosting model stays the same.

---

## Part 5 — Email Service (per sending domain)

The booking endpoint sends a customer confirmation to **arbitrary** recipient addresses, which requires the sending domain to be onboarded:

1. **Cloudflare Dashboard → Email → Email Service** → onboard the brand's sending domain (add the SPF/DKIM/DMARC DNS records it generates and verify).
2. Ensure `EMAIL_FROM` for that project uses an address **on the onboarded domain**.
3. Until a domain is onboarded, sends are limited to individually **verified destination addresses** — fine for the admin email, but the customer confirmation to strangers will fail. **Onboard before go-live.**
4. Mind the platform limits: up to 50 recipients per message, 5 MiB max size, and a conservative starting daily quota that grows with reputation.

Each brand typically has its **own sending domain**, so repeat this per brand.

---

## Part 6 — Custom domain (per project)

1. In the brand's Pages project → **Custom domains → Set up a custom domain**.
2. Enter the brand's domain (e.g. `redcow.co.uk`).
3. If the domain's DNS is on Cloudflare, records are added automatically; otherwise add the shown CNAME at your DNS provider.
4. Wait for the certificate to issue (automatic). The site is then live on the brand domain in addition to `*.pages.dev`.
5. Make sure `PUBLIC_SITE_URL` and `ALLOWED_ORIGINS` for the project match this domain.

---

## Per-brand quick checklist

For **each** new site, in order:

- [ ] `Copy-Item -Recurse src\assets\whitelabel src\assets\<brand>` and fill in content, styles, logo, images, fonts, menus, favicon.
- [ ] Commit `src/assets/<brand>/` to `main`.
- [ ] Create a Cloudflare Pages project named `<brand>`, connected to this repo, production branch `main`.
- [ ] Build command `npm run build`, output `dist`.
- [ ] Set build vars: `PUBLIC_BRAND=<brand>`, `PUBLIC_SITE_URL`, `NODE_VERSION`.
- [ ] Set runtime vars: `ALLOWED_ORIGINS`, `EMAIL_FROM`, `EMAIL_FROM_NAME`, `EMAIL_ADMIN`.
- [ ] Ensure the `send_email` binding (`EMAIL`) is present (via `wrangler.toml` or project bindings).
- [ ] Onboard the brand's sending domain in Email Service; confirm `EMAIL_FROM` is on it.
- [ ] Add the custom domain and wait for the certificate.
- [ ] Trigger a deploy (push to `main` or "Retry deployment") and verify: pages render with brand assets, menus load, booking POST succeeds, and **both** admin + customer emails arrive.

---

## Common pitfalls

- **`PUBLIC_BRAND` not set** → `setup-tsconfig.js` exits with an error and the build fails. Every project must define it.
- **Asset folder missing/misnamed** → `@brand/...` imports fail at build. The folder name must exactly match `PUBLIC_BRAND`.
- **Sending domain not onboarded** → admin email works, customer confirmation fails. Onboard first.
- **`EMAIL_FROM` not on the onboarded domain** → sends rejected. Keep them aligned.
- **Mismatched `PUBLIC_SITE_URL` / `ALLOWED_ORIGINS`** → canonical URLs or CORS/origin checks break on the live domain.
