---
description: Create a feature branch, ensuring a clean state on latest main
argument-hint: [optional TICKET-ID] <short description>
---

# Create Feature Branch

Create a feature branch, ensuring a clean state on latest main. This project has no ticket-tracker
integration configured, so the branch name is built manually rather than fetched from an API.

## Arguments

$ARGUMENTS — a short description of the work, optionally prefixed with a ticket ID if you have one
from wherever you track work manually (e.g. `PROJ-1234 update booking form` or just
`update booking form`).

If `$ARGUMENTS` is empty, ask the user for a short description and stop.

## Step 1: Check for Uncommitted Changes

```bash
git status --porcelain
```

**If there are uncommitted changes:**

```
You have uncommitted changes. Please commit, stash, or discard them before creating a new branch.
```

**STOP and wait for user to resolve.**

## Step 2: Ensure We're on Main

```bash
git branch --show-current
```

**If not on main:**

```
Currently on branch '<branch-name>'. I need to switch to main to create the new branch.
Switch to main? (y/n)
```

**STOP and wait for confirmation.** If the user declines, stop entirely.

If confirmed:

```bash
git checkout main
```

## Step 3: Get Latest Main

```bash
git pull origin main
```

If pull fails, inform the user and stop.

## Step 4: Generate Branch Name

This project's convention is `<TICKET-ID>-<kebab-case-summary>`, where `TICKET-ID` is optional
(there's no tracker to validate it against — it's whatever the developer typed, or omitted):

1. If `$ARGUMENTS` starts with something ticket-ID-shaped (e.g. `PROJ-1234`, `BOARD-123`, `#123`),
   treat it as the `TICKET-ID` and uppercase it as-is; the rest of `$ARGUMENTS` is the summary.
2. If no ticket-ID-shaped prefix is present, the whole of `$ARGUMENTS` is the summary and there is
   no `TICKET-ID` segment.
3. Convert the summary to kebab-case: lowercase, replace spaces/special chars with hyphens, remove
   consecutive hyphens.
4. Combine: `<TICKET-ID>-<kebab-summary>` if a ticket ID was found, otherwise just
   `<kebab-summary>`.
5. Truncate to 60 characters max (don't cut mid-word).

Present to user:

```
Branch name: <generated-name>
Create this branch? (y, or type a different name)
```

**STOP and wait for confirmation or alternative.**

## Step 5: Create and Checkout Branch

```bash
git checkout -b <branch-name>
```

## Step 6: Confirm

```
Branch '<branch-name>' created from latest main.
You're ready to start work.
```

## Rules

- NEVER create a branch with uncommitted changes
- NEVER switch branches without user confirmation
- Always pull latest main before branching
- Always confirm the branch name with the user before creating
- No tracker is configured — never fabricate a ticket ID or fetch one from an API; only use one
  the user actually typed
