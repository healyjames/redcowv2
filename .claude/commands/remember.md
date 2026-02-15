---
description: Store knowledge in persistent memory for future sessions
argument-hint: <topic> optional
---

# Remember Command

Store knowledge in persistent memory for future sessions.

## Arguments

`$ARGUMENTS` - Optional context about what to remember

## Process

### 1. Analyze Recent Conversation

Review the conversation to identify:

- **Decisions made** - Architectural choices, technology selections, approaches chosen
- **Patterns discovered** - Code patterns, naming conventions, project structure
- **User preferences** - Workflow preferences, style choices, tool preferences
- **Key learnings** - Important context about the codebase, gotchas, constraints

### 2. Consider User Input

If `$ARGUMENTS` provided, focus on that specific topic.

If no arguments, infer what seems most valuable to remember from recent context.

### 3. Draft Memory Entry

Format the memory as:

```
## <Topic>

**Context:** <when/why this is relevant>

**Details:**
- <key point 1>
- <key point 2>

**Tags:** <project>, <category>
```

### 4. Present for Approval

```markdown
## Proposed Memory

<drafted memory entry>

---

**Store this memory?** (y/n, or provide feedback to adjust)
```

**STOP and wait for user approval.**

### 5. Store on Approval

After user confirms with `y`:

**If Memory MCP is configured:**
Use the Memory MCP `create_entities` or `add_observations` tool to store the memory.

Include:

- Timestamp
- Project context (current directory/repo name)
- The memory content

```
Memory stored.

To recall: memories are automatically checked during /research and /plan.
To browse: use /recollect <topic>
```

**If Memory MCP is not configured:**

```
Memory MCP is not configured.
To persist this knowledge, consider:
1. Adding it to CLAUDE.md or a docs file
2. Configuring Memory MCP for cross-session memory
```

## Memory Categories

Useful categories to tag memories:

- `architecture` - System design decisions
- `patterns` - Code patterns to follow
- `preferences` - User/project preferences
- `constraints` - Limitations, gotchas, things to avoid
- `context` - Project background, business logic

## Examples

**User:** `/remember`
**Claude:** Reviews recent conversation, proposes memory about discussed refactoring approach

**User:** `/remember we decided to use Zod for all API validation`
**Claude:** Proposes memory specifically about Zod decision with context

**User:** `/remember the auth flow`
**Claude:** Proposes memory summarizing authentication implementation discussed

## Rules

- Never store secrets, credentials, or sensitive data
- Keep memories concise and actionable
- Include enough context to be useful in future sessions
- Always get user approval before storing
