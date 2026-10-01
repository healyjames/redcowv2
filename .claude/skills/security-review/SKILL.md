---
name: security-review
description: Security-audit a change set (or a target) against OWASP Top 10, secret exposure, dependency risk, and trust-boundary validation; classify by severity and block on Critical. Use for /security and the /audit security dimension.
allowed-tools: Read, Grep, Glob, Bash
---

# Security Review (rubric)

Audit code for security issues and report them with concrete, actionable fixes. Apply judgement —
weight by exploitability and blast radius in *this* system. Only flag issues in the reviewed code,
not pre-existing ones.

## Scope

Default to the branch change set (`git diff <base>...HEAD`), or a named target for a standalone
audit. Read the surrounding code to judge exploitability.

## What to look for

- **Injection** — command/template injection from untrusted input; unsafe deserialization;
  `dangerouslySetInnerHTML`/raw HTML injected into `.astro` templates or React islands without
  sanitization (XSS) — especially anything rendering brand content from
  `src/assets/<brand>/content`.
- **Trust-boundary validation** — every external input to `src/pages/api/**` routes (request
  bodies, query params, form submissions like the booking form) validated/sanitized before use;
  no unvalidated data reaching `src/libs/email` (email header/body injection).
- **AuthZ / AuthN** — missing or incorrect authorization checks; insecure session/token handling;
  privilege escalation paths; IDOR. (This is a public-facing static/booking site — check whether
  any admin/internal routes exist and whether they're actually gated.)
- **Secrets** — hardcoded keys/passwords/tokens; secrets logged or returned in responses; secrets
  committed. Cloudflare Workers secrets belong in `env` bindings / `.dev.vars` (gitignored), never
  in source or client-bundled React island code. (Also: never *read* production secret values —
  dev/test only.)
- **Sensitive data** — guest PII from bookings (name, email, phone, party details) not logged,
  cached, or exposed unnecessarily; encrypted in transit (Cloudflare handles TLS) — check nothing
  bypasses it.
- **Dependencies** — new/updated deps with known CVEs. Run `npm audit` when `package.json`/
  `package-lock.json` changed.
- **Config / infra** — overly permissive CORS on API routes, missing rate limits on the booking
  endpoint (abuse potential), debug/verbose errors leaking internals, insecure defaults in
  `wrangler.jsonc` per brand.
- **Multi-tenant isolation** — a request for one brand must never read/leak another brand's
  content, secrets, or `.dev.vars` — check brand resolution logic doesn't trust unvalidated input
  to pick a brand/tenant.
- **Domain rules a linter won't catch** — e.g. "reject any migration that drops a column without a
  backfill step." Encode the project's real invariants.

## Severity (the gate)

- **Critical** — exploitable vulnerability or secret exposure. **Blocks merge.**
- **High** — likely-exploitable or significant weakness; resolve before PR.
- **Medium / Low** — defense-in-depth improvements; note.

## Output

Verdict (PASS / FAIL), counts by severity, and per finding: `file:line`, the vulnerability, its
impact, and a specific remediation. Start with a report to the user; fix Critical/High only when
asked, then re-audit to verify.
