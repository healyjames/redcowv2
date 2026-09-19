# Workflow Configuration

## Project
- Language: TypeScript (strict — `astro/tsconfigs/strict`)
- Framework: Astro 7 + React 19 (islands), deployed to Cloudflare Workers (`wrangler`)
- Monorepo: No — single `package.json`, but multi-tenant: each brand under `src/assets/<brand>`
  (e.g. `redcow`, `whitelabel`, `base`) has its own `wrangler.jsonc` and is deployed as its own
  Cloudflare Worker
- Package manager: npm (`package-lock.json`)

## Commands
- Test: `npm test` (Vitest + React Testing Library — see `.claude/docs/testing.md`)
- Lint: not configured
- Format: not configured
- Format check: not configured
- Build: `npm run build` (runs `scripts/setup-tsconfig.js` then `astro build`)
- Dev: `npm run dev` (runs setup then `astro dev`)
- Preview: `npm run preview`

## Ticket Tracker
- System: None

## Git
- Hosting: GitHub (`healyjames/redcowv2`)
- Default branch: main
- Branch convention: `<TICKET-ID>-<kebab-case-summary>` (`TICKET-ID` optional/manual — no tracker)

## Working Directories
- AI temp files: .claude/temp/
- AI docs: .claude/docs/

## Modules
- observability: skipped
- audit:         installed
- release:       n/a
- secrets:       n/a

## Audit
- Targets: redcowv2 (single-app target — this whole repo; not a monorepo)
- Dimensions: dead-code, code-quality, type-safety, potential-bugs, error-handling, security,
  performance, test-quality, schema-consistency, dry-duplication, documentation-drift,
  accessibility, dependency-health. (`logging` dropped — observability module not installed.)
- Output: .claude/audit/<date>/

## Project Conventions
- Architecture: vertical slice / feature folders — see `.claude/docs/architecture.md`
- Testing: TDD, Vitest + React Testing Library (not yet installed as devDependencies — see
  `.claude/docs/testing.md`) — see `.claude/docs/testing.md`
- Coding guidelines: see `.claude/docs/coding.md` (expands `CLAUDE.md`)

## Commit-guard hook
- Installed: `.claude/hooks/commit-guard.sh`, wired via a PreToolUse hook in `.claude/settings.json`

## Forge Workflow
- Version: 1.2.0
