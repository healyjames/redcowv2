---
description: Run research phase only
argument-hint: <task-description>
---

# Research Phase

Task: $ARGUMENTS

## Instructions

Run the `researcher` agent to explore the codebase for this task.

### If plan directory exists

Output to the existing plan directory's research.md.

### If no plan directory

Ask user for task slug or generate one, then create:

```bash
mkdir -p .claude/temp/<slug>
```

Output to `.claude/temp/<slug>/research.md`.

## What the Researcher Does

1. Reads docs, READMEs, ADRs, plans, vision files
2. Finds relevant code for the task
3. Identifies patterns to follow
4. Documents constraints and considerations
5. Suggests an approach
6. If an approach is given by users, assesses approach and gives relevant feedback and alternatives

## Optional Integrations

### Memory MCP (if configured)

Before spawning the researcher agent, briefly check Memory MCP for task-relevant context:

```
Use `search_nodes` with keywords from the task description.
Pass any relevant memories to the researcher agent in the prompt.
```

If Memory MCP is not available, skip this step - the researcher will gather context from the codebase directly.

### Jira (if configured)

If the task references a Jira ticket or the branch name contains a ticket ID, attempt to fetch ticket details. If Jira credentials are not configured, skip this step.

### GitHub (if referenced)

If the task references a GitHub issue or PR, fetch context using `gh`. If not referenced, skip this step.

## After Research

```
Research complete: .claude/temp/<slug>/research.md

Run /plan to create implementation plan, or /begin to run full workflow.
```

## Rules

- Use the researcher agent - don't do manual research
- Output must go to a plan directory
- Ask clarifying questions if scope is genuinely unclear
