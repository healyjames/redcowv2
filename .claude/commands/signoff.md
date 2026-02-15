---
description: Present research and plan for approval
---

# Signoff Phase

## Prerequisites

Requires both research.md and plan.md. If missing:

```
Missing required files.
- research.md: <found/not found>
- plan.md: <found/not found>

Run /research and /plan first, or /begin for full workflow.
```

## Instructions

Read both files and present summary:

```markdown
## Research Summary

**Task:** <task description>

### Key Findings

<3-5 bullet points from research>

### Approach

<recommended approach from research>

---

## Plan Summary

**Subtasks:** <N> planned

1. **<subtask 1 title>**
   <goal>

2. **<subtask 2 title>**
   <goal>

...

### Risks

<from plan, if any>

### Out of Scope

<from plan>

---

**Approve?** (y/go, or provide feedback)
```

**STOP and wait for explicit approval.**

## After Approval

Check that we are on the correct branch, which should have been made already. Prompt the user if not
Update plan.md Status to `IN_PROGRESS`.
Prompt the user to commit the work with a sensible commit message. Then ask them to continue work or move on to the next step.

```
Run /next to start the next task.
```

## Rules

- NEVER proceed without explicit user approval
- Present both research findings and plan summary
- If user has concerns, address them before proceeding
- Always make sure we are on the right branch before starting work
