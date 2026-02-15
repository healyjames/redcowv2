---
description: Run dev phase for current subtask
---

# Dev Phase

## Prerequisites

Requires active plan with a subtask ready for dev:

- Plan exists with Status: `IN_PROGRESS`
- Current subtask has `- [ ] Dev` unchecked

## Instructions

Implement the current subtask:

### 1. Understand the subtask

Read the plan.md to understand:

- Subtask goal
- Files to create/modify/delete
- Context from previous subtask

### 2. Implement

Write the implementation code following:

- Patterns identified in research.md
- Existing codebase conventions
- CLAUDE.md standards

### 3. Write Tests

Use `test-writer` agent for tests if applicable:

- Unit tests for new functions
- Integration tests for new endpoints
- Follow black-box, behavior-focused testing
- Test all core functionality and business logic

### 4. Documentation

Use `doc-writer` agent if needed:

- Update README if public API changes
- Add JSDoc for complex functions
- Update ADRs if architectural decisions made

### 5. Verify

```bash
# Run tests
npm run test

# Run lint/type-check
npm run lint
npm run format:check
```

Fix any failures before completing.

### 6. Update Plan

Check `- [x] Dev` in plan.md for this subtask.

**NEVER commit automatically.** Prompt the user to validate the work and suggest a commit message. Wait for user to commit.

## After Dev

```
Dev complete for Subtask <N>: <title>

Files changed:
- <file list>

Tests: <passing/failing>
Lint: <clean/issues>

Suggested commit message: <concise description>

Please review and commit when ready, then run /review to continue.
```

## Rules

- Stay within scope of the current subtask
- Don't implement future subtasks
- Tests and lint must pass before completing
- Use test-writer agent for tests, not manual test writing
- Update plan.md checkbox when complete
- NEVER commit on behalf of the user - only suggest commit messages
- If work on this subtask might affect future work in the plan, update the user and ask for permission to change the plan
