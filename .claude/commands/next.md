---
description: Execute next subtask cycle in current plan
---

# Execute Next Subtask

## Step 1: Find Current Plan

Look for an active plan:

1. Check `.claude/temp/*/plan.md` files
2. Find one with Status: `IN_PROGRESS` or `READY`
3. If multiple, show list and ask user to select
4. If none, error: "No active plan found. Run /begin to start new work or /resume to resume existing."

## Step 2: Find Next Subtask

Parse the plan.md to find the next incomplete subtask:

- Look for first subtask where `- [ ] Dev` is unchecked
- Update plan.md Status to `IN_PROGRESS` if it was `READY`

Display:

```
Executing: Subtask <N> of <total>
Title: <subtask title>
Goal: <subtask goal>
```

## Step 3: Dev Phase

Implement the subtask:

1. Prompt the user with the goal of what you intend to write.

- If anything is unclear, prompt the user for clarification or more information rather than make assumptions

2. Write the implementation code
3. Use `test-writer` agent for tests (if applicable)
4. Use `doc-writer` agent for docs (if needed)
5. Run tests: ensure they pass
6. Run lint/type-check: ensure clean

Update plan.md: check `- [x] Dev`

**Auto-proceed to Review phase.**

## Step 4: Review Phase

Run review cycle:

1. Use `/review` agent on changes

**For Critical/High issues:**

- Fix immediately
- Re-run /review
- Repeat until clean

**For Medium issues:**

- Fix if straightforward
- Or note for user in Present phase

**For Low issues:**

- Note for user, don't block

Update plan.md: check `- [x] Review`

**Auto-proceed to Present phase.**

## Step 5: Present Phase

Present to user:

```markdown
## Subtask <N>: <title>

### Summary

<what was implemented>

### Files Changed

| File | Change           | Lines |
| ---- | ---------------- | ----- |
| ...  | created/modified | +X/-Y |

### Tests

- Added: <N> tests
- Passing: Yes/No

### Review Results

- Critical: 0 (must be 0)
- High: <N>
- Medium: <N>
- Low: <N>

### Outstanding Items

<any issues noted for user attention>

---

**Approve?** (y/go, or provide feedback)
```

**STOP and wait for user approval.**

If user provides feedback:

- Implement changes
- Re-run review if significant changes
- Present again

Update plan.md: check `- [x] Present`

## Step 6: Commit Phase

**NEVER commit automatically.** Always prompt the user to commit work when complete.

Suggest a commit message:

```
Suggested commit message: <concise description of subtask>

Please commit when ready, then say "done" to continue.
```

Wait for user confirmation before proceeding.

## Step 7: Next Steps

After user confirms commit:

```
Subtask <N> complete.

<remaining> subtasks remaining in plan.
Run /next to continue.
```

If this was the last subtask:

```
All subtasks complete!

Next steps:
- /review - Final review step for all work on the branch
- /security - Run security audit on all changes (recommended)
- /pr - Open pull request
```

## Rules

- NEVER skip review phase
- NEVER commit without user approval at Present phase
- NEVER commit on behalf of the user - only suggest commit messages
- Fix Critical/High issues before presenting
- Update plan.md checkboxes as you complete each phase

## Tracking

- **plan.md checkboxes**: Track cross-session progress (persistent)
- **TodoWrite**: Track in-session subtasks during complex Dev phases (ephemeral)
