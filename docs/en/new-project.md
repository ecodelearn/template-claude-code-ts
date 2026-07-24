# New project

[Português](../pt-BR/new-project.md) · [English](new-project.md)

## 1. Create a repository

```bash
mkdir my-project
cd my-project
git init
```

## 2. Preview adoption

From a compiled Agent Harness checkout:

```bash
node /path/to/agent-harness/dist/adopt.js \
  --tool codex \
  --target "$PWD" \
  --dry-run
```

## 3. Apply the provider

```bash
node /path/to/agent-harness/dist/adopt.js --tool codex --target "$PWD"
```

The provider uses a public source pinned by commit. It does not enable MCP servers
or modify global configuration.

## 4. Initialize project context

Open the chosen agent at the repository root and run `project-init`. Define the
project language, purpose, stack, build/lint/test commands, non-negotiable rules,
and first spec.

Review generated memory before committing it. Never store tokens, credentials,
personal data, or private machine paths.

## 5. Validate and commit

```bash
git status
git diff
# run the project's build, lint, and tests
git add AGENTS.md .claude .agents
git commit -m "chore: adopt agent harness"
```

Installed paths differ for Claude and Gemini; see [Providers](providers.md).
