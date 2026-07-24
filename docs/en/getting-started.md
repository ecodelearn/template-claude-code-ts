# Installation and first use

[Português](../pt-BR/getting-started.md) · [English](getting-started.md)

## Requirements

- Git
- Node.js 20 or newer
- npm
- A target project already initialized as a Git repository

The npm package remains `private: true`. Run it from a checkout for now:

```bash
git clone https://github.com/ecodelearn/template-claude-code-ts.git
cd template-claude-code-ts
npm ci
npm run build
```

## First preview

```bash
node dist/adopt.js \
  --tool codex \
  --target /path/to/project \
  --dry-run
```

Replace `codex` with `claude` or `gemini` as needed. Review every planned action:
copy, preserve, prompt, overwrite, or missing.

## Apply

```bash
node dist/adopt.js --tool codex --target /path/to/project
```

The CLI prints a transaction ID and an exact rollback command. Keep the backup
until the adopted project is validated.

## Validate

1. Review `git status` and `git diff`.
2. Open the selected agent at the repository root.
3. Confirm that repository instructions are loaded.
4. Run `project-init` for a new project or `project-adopt` for an existing one.
5. Run the project's build, lint, and test commands.
6. Remove the transaction backup only after acceptance.

```bash
node /path/to/harness/dist/adopt.js --target . --list-transactions
node /path/to/harness/dist/adopt.js --target . --forget <id>
```

## Future npm interface

```bash
npx @ecodelearn/agent-harness --tool codex --target . --dry-run
```

This is not available from the public registry while `private: true` remains set.
