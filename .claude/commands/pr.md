---
description: Final checks and prepare pull request for current plan
---

# Check Pull Request

Check that all everything has been commited and is ready for a pull request

## Step 1: Check Security Audit Status

Check if `/security` has been run for this plan:

- Look for security audit results in conversation history
- If not run, remind user:

```
Security audit not run. Consider running /security first.
Continue with PR anyway? (y/n)
```

If user declines, stop and let them run `/security`.

## Step 2: Verify Plan Complete

Find the current active plan and verify all subtasks are complete or marked as to do in another PR:

1. Read `.claude/temp/*/plan.md` for active plan
2. Check all subtasks have `- [x] Dev`, `- [x] Review`, `- [x] Present` checked

If incomplete:

```
Plan is not complete.

Remaining subtasks:
- Subtask <N>: <title> (needs: Dev, Review, Present)
- Subtask <M>: <title> (needs: Present)

Run /next to continue.
```

## Step 3: Verify Branch State

```bash
git status
git log dev..HEAD --oneline
```

Ensure:

- No uncommitted changes
- Branch has commits ahead of main
- All planned commits are present

If uncommitted changes:

```
Warning: Uncommitted changes detected.
Commit or stash before opening PR? (y/n)
```

## Step 5: Generate PR Description

Use `pr-description` agent with context:

- Task description from plan metadata
- All commit titles and goals
- Summary of what was built

## Step 6: Present for Approval

```markdown
## Pull Request Preview

**Title:** <generated title>

**Description:**
<generated description>

---

**Approve?** (y/go, or provide feedback)
```

**STOP and wait for user approval.**

If user provides feedback:

- Adjust title/description
- Present again

## Step 7: Create PR

After approval:

```bash
gh pr create --title "<title>" --body "<description>" --web
```

## Step 8: Update Plan

Update plan.md:

- Set Status to `COMPLETE`
- Add PR link if desired

## Step 9: Report

```
PR created: <url>

Plan '<plan-name>' is now complete.
```

## Rules

- NEVER create PR with incomplete commits
- NEVER create PR without user approval of title/description
- Always ask user to push branch before creating PR
- Use pr-description agent for consistent formatting
