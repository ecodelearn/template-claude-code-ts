# Installation and first use

[Português](../pt-BR/getting-started.md) · [English](getting-started.md)

## Requirements

- Git
- Node.js 20 or newer
- npm
- A target project already initialized as a Git repository

`@ecodelearn/agent-harness` is published on npm — no checkout needed:

```bash
npx @ecodelearn/agent-harness --tool codex --target /path/to/project --dry-run
```

Replace `codex` with `claude` or `gemini` as needed.

### Alternative: from a source checkout

```bash
git clone https://github.com/ecodelearn/template-claude-code-ts.git
cd template-claude-code-ts
npm ci
npm run build
node dist/adopt.js --tool codex --target /path/to/project --dry-run
```

## First preview

```bash
npx @ecodelearn/agent-harness --tool codex --target /path/to/project --dry-run
```

Review every planned action: copy, preserve, prompt, overwrite, or missing.

## Apply

```bash
npx @ecodelearn/agent-harness --tool codex --target /path/to/project
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
npx @ecodelearn/agent-harness --target . --list-transactions
npx @ecodelearn/agent-harness --target . --forget <id>
```
