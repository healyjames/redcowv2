---
name: cloudflare-readonly
description: Inspect this project's live Cloudflare account — Worker config, deployment history, routes/subdomains, traffic and error analytics — via the Cloudflare MCP tools. Use whenever asked what's deployed, how a Worker is configured, recent traffic/errors, or to reconcile live state against wrangler.jsonc. Never mutates Cloudflare resources.
allowed-tools: mcp__plugin_cloudflare_cloudflare__execute, mcp__plugin_cloudflare_cloudflare__search, mcp__plugin_cloudflare_cloudflare__docs
---

# Cloudflare read-only inspection

Scoped to the Cloudflare account already authenticated via the MCP OAuth flow — the `execute` tool
pre-sets `accountId` for that account, so never hardcode an account ID or email in this file. Known
Workers on this account: `redcowv2` (this repo, deploys from `src/assets/redcow/wrangler.jsonc`) and
`maximum-bookings` (separate project, same account).

## Hard rule: read-only, always

The `execute` tool's OAuth token **can issue POST/PUT/PATCH/DELETE** — Cloudflare does not offer a
scoped read-only grant for this MCP server. The read-only boundary is enforced by *this skill*, not
by the token, so it must be followed deliberately every time:

- Only call `cloudflare.request` with `method: "GET"`.
- Exception: the GraphQL analytics endpoint (`/graphql`) requires `POST` even for read queries —
  that's fine. Never send a GraphQL **mutation**.
- Never call a `workers/scripts/...` endpoint with PUT (deploy/upload), DELETE (delete script), or
  PATCH.
- If a task actually needs a write — deploying, rotating a secret, editing a route, changing a
  binding — stop and tell the user to run it themselves via `wrangler` or the dashboard. Do not
  perform "just this once" writes even if asked in the moment; that's a decision for the user to make
  outside this skill.

## What to check, and how

- **List Workers**: `GET /accounts/{accountId}/workers/scripts`
- **Deployment history**: `GET /accounts/{accountId}/workers/scripts/{name}/deployments` — watch for
  `source: "dash"` / `"dash_template"` entries mixed in with `"wrangler"` ones. That means someone
  deployed or edited from the Cloudflare dashboard outside of git, which can drift from
  `wrangler.jsonc`. Flag it, don't assume it's fine.
- **Subdomain / routes**: `GET .../workers/scripts/{name}/subdomain`; use the `search` tool to find
  the routes/custom-domains endpoints rather than guessing a path.
- **Traffic & errors**: GraphQL `workersInvocationsAdaptive` dataset, filtered by `datetime_geq`/
  `datetime_leq`, dimensioned by `scriptName`, summed for `requests`/`errors`/`subrequests`.
- Use the `search` tool first to find the right endpoint/schema before writing `execute` code — don't
  guess paths from memory.

## Reporting back

State findings plainly — what's deployed, when, from what source, current traffic — rather than
speculating about causes you haven't checked. Surface anything that looks like configuration drift
(e.g. a dashboard deploy after the last git-tracked wrangler deploy) instead of trying to fix it.
