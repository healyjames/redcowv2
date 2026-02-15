---
description: Start new work - research, plan, and signoff
argument-hint: <task-description>
---

# Begin New Work

Task: $ARGUMENTS

## Step 0: Safety Checks

Before starting new work, verify git state:

```bash
git status
```

**If uncommitted changes:**

```
Warning: Uncommitted changes detected.
Commit, stash, or discard before starting new work? (y/n)
```

Wait for user to resolve before proceeding.

**If not on dev or a feature branch:**

```
Warning: Currently on branch '<branch-name>', not dev.
Switch to dev before starting new work? (y/n)
```

Note: The main branch for this repo is `dev`, not `main`.

## Step 1: Generate Task Slug

Generate a kebab-case slug from the task description.

- Remove common words (the, a, an, to, for, etc.)
- Lowercase and hyphenate
- Keep it short but descriptive
- **Validate:** only lowercase alphanumeric and hyphens, max 50 chars
- **Reject:** any path separators (/, \, ..)

Present to user:

```
Creating plan directory: .claude/temp/<slug>/
Is this name ok? (press 'y' to confirm, or type a different name)
```

Wait for user confirmation or alternative name.

## Step 2: Create Directory

Check if directory already exists:

```bash
ls .claude/temp/<slug> 2>/dev/null
```

**If directory exists:**

```
Plan directory '.claude/temp/<slug>/' already exists.
Options:
1. Use a different slug
2. Resume existing plan (/resume)
```

Do not overwrite existing plans.

**If directory doesn't exist:**

```bash
mkdir -p .claude/temp/<slug>
```

## Step 3: Research Phase (Optional Jira/Memory Integration)

**Jira Integration (optional):**
If the task references a Jira ticket or the branch name contains a ticket ID, attempt to fetch ticket details using /jira. If Jira credentials are not configured, skip this step and continue.

**Memory MCP Integration (optional):**
If Memory MCP is configured, search for relevant context using `search_nodes`. If Memory MCP is not available, skip this step - the research phase will gather context from the codebase directly.

Use the `researcher` agent to explore the codebase.

Provide the agent with:

- The task description
- Any Jira context (if available)
- Any Memory context (if available)
- Output path: `.claude/temp/<slug>/research.md`

The researcher will:

- Read docs, ADRs, plans, vision files
- Find relevant code
- Identify patterns to follow
- Document findings in research.md

## Step 4: Planning Phase

Use the `planner` agent to create the implementation plan.

Provide the agent with:

- The task description
- Path to research.md
- Output path: `.claude/temp/<slug>/plan.md`

The planner will:

- Break work into subtasks (small, committable steps)
- Define goals and files for each subtask
- Create trackable checklists

## Step 5: Signoff

Present a summary to the user:

```markdown
## Research Complete

<key findings from research.md>

## Plan Summary

<number> subtasks planned:

1. <subtask 1 title>
2. <subtask 2 title>
3. ...

**Approve?** (y/go, or provide feedback)
```

**STOP and wait for explicit user approval.**

Do NOT proceed without signoff.

## Rules

- NEVER skip research or planning phases
- NEVER proceed past signoff without explicit approval
- If research or planning raises questions, ask them before signoff
- Jira and Memory MCP are optional enhancements - proceed without them if unavailable

## Tracking

- **plan.md checkboxes**: Track cross-session progress (persistent)
- **TodoWrite**: Track in-session subtasks (ephemeral, for complex phases)
