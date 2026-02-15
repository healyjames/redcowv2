# Development Guidelines for Claude

> **About this file:** This is a modular version with detailed documentation loaded on-demand. The main file (this one) provides core principles and quick reference. Detailed guidelines are in separate files imported via `@~/.claude/docs/...`.

# Git Operations Policy

⛔ **NEVER commit or push to git without explicit user request**

- DO NOT run `git commit`, `git push`, or `git add` unless explicitly asked
- Code changes and file modifications are fine
- User will handle all git operations (commits, pushes, etc.)
- Exception: Branch operations like checkout may be acceptable when instructed

# About the app

This is a general purpose Claude file, details about this repo itself are in docs/app-details.md
Please make sure you read the package.json to understand what technology we are using for this app.

# Coding guidelines

Code should be self-documenting. Please avoid leaving comments in code unless they are needed to understand the code. Examples of appriate comments are explaining regex that isn't instantly understandable, or explaining imports from a third party like the fonts loaded through an adobe stylesheet.

- No data mutation - immutable data structures only where possible
- Pure functions wherever possible
- No nested if/else - use early returns or composition
- No comments - code should be self-documenting
- Prefer options objects over positional parameters
- Use array methods (`map`, `filter`, `reduce`) over loops

**EditorConfig rules:**

- 2-space indentation
- UTF-8 charset
- Insert final newline
- Trim trailing whitespace
- Markdown: preserve whitespace, no line length limit

# Planning and executing work

When making changes, please make a _-plan.md file (where you name it appropraitely) with a checklist. Always go back and update this file, either checking off as you go along, or changing the checklist if you are asked for changes.
When asked for an audit, make a single file at _-audit, and again, keep this up to date or ammend by adding to the end after we have made updates, rather than making multiple files.
All .md files should be saved to ./ai unless specified otherwise. It will then be up to the user to move these to other folders when they are considered ready.

# Typescript

Follow best practices wherever possible. Avoid using any at all costs. When using unknown, it must have a comment exaplianing why if it is not obvious.
Strict mode always. Schema-first at trust boundaries, types for internal logic.

**Unused parameters:** When a function parameter is required by an interface but not used in the implementation, prefix it with an underscore (e.g., `_context` instead of `context`). This silences IDE warnings about unused variables while maintaining the function signature.

# Self-learning

Claude should invoke the self-learning agent and keep a learnings.md file up to date. The purpose of this is to make sure claude is learning from the input of our developers, and synced across developers. This learnings file should contain things that developers include often in prompts, so that they start to happen by default, whether that is coding style, technology we use, or things about the app or third party integrations.

# Teach

If the developer is unclear about how something works, please use the agents/teach-mode.md agent to help give them better context, examples, and links to documentation.

# .MD Files

Whenever creating .md files, whether it was requested by the developer, created by claude/cursor for documentation or context retention, or to track progress, always save it into ./claude/temp/
The developer will decide whether this file should continue to live in the reponsitory after the feature is complete. These files are written for ai first, and so a developer should think about rewriting it for developers if the intention is to keep it in the repo.
Developers need to be responsible for the files they leave in .temp across PR's and commits, but you need to make sure that they are named correctly.
Keep docs concise. Do not write the same thing in multiple ways. If it is intended for human use, make sure to keep it short enough for human retention. If it is intended for ai use, prepend -ai to the end of the name. If the user has request the doc to be written specifically as documentation, save it to /docs rather than ./claude/temp

# Claude files

All claude files should be treated as living files. That means claude and claude agensts should keep them up to date i.e. when we update our tech stack, update the .claude/docs/app-details.md file. Or something that has been added to learnings.md might be important enough to include in the main .claude.md
Remember thse are shared by all developers. You should always prompt the developer when you intend to update a claude file for permissions.
