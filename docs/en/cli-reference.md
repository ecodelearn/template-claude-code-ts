# CLI reference

[Português](../pt-BR/cli-reference.md) · [English](cli-reference.md)

## Adoption

```text
agent-harness --tool <provider> [--source <repo-or-path>]
  [--ref <tag-or-commit>] [--target <directory>] [--yes] [--dry-run]
```

| Option | Purpose |
|---|---|
| `--tool` | `claude`, `codex`, `gemini`, or legacy alias `antigravity` |
| `--source` | `owner/repo`, Git URL, or local path |
| `--ref` | required tag/commit for a custom remote source |
| `--target` | Git repository root; defaults to current directory |
| `--dry-run` | prints the plan without copying, removing, or post-processing |
| `--yes` | accepts overwrite prompts; use only after preview |

Provider defaults are pinned by SHA. Local sources are used as-is and reject
`--ref`.

## Transactions

```bash
agent-harness --target . --list-transactions
agent-harness --target . --rollback <id>
agent-harness --target . --forget <id>
agent-harness --target . --forget <id> --yes
```

- `--rollback` restores an applied transaction;
- `--list-transactions` lists transactions bound to the current project;
- `--forget` permanently deletes one backup and asks for confirmation.

Backups live under `.git/adopt-cli/transactions/<id>` and never enter the working
tree. There is no wildcard cleanup operation.

## Exit codes

- `0`: completed command or safe prompt cancellation;
- `1`: invalid argument, unavailable source, invalid project, or operational error.

## Examples

```bash
agent-harness --tool codex --target . --dry-run
agent-harness --tool claude --target . --yes
agent-harness --tool gemini --source owner/template --ref v1.2.0 --target .
```
