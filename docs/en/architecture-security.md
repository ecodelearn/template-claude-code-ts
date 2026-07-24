# Architecture and security

[Português](../pt-BR/architecture-security.md) · [English](architecture-security.md)

## Components

1. `template-claude-code-open`: canonical public shared content.
2. `@ecodelearn/agent-harness`: CLI, source resolution, and transactions.
3. Providers: Claude, Codex, and Gemini-specific rules.
4. Target repository: the only authorized write scope.

## Flow

```text
arguments → provider → pinned source → plan → confirmation
          → full pre-validation → backup → copy → post-processing
          → completed manifest
```

`--dry-run` stops after planning. Real execution validates every destination before
transaction state or target files are created.

## Threat model

The installer reduces accidental overwrite, path traversal, mutable remote source,
local secret copying, cross-project rollback, and npm package-content risks.

It does not protect against a deliberately malicious local source, compromised
Git/Node/npm installations, excessive operating-system privileges, or malicious
instructions inside otherwise allowed files. Review the source and resulting diff.

## Backups

Backups use the actual Git directory, including worktrees:

```text
.git/adopt-cli/transactions/<id>/
├── manifest.json
└── backup/
```

The parent directory uses restrictive permissions where supported. Backups may
contain old configuration; remove them individually after validation.

## Never-copied data

- `.env`, `.envrc`, and any basename starting with `.env`;
- `*.pem`, `*.key`, `*.p12`, `*.pfx`;
- `README_MCP.md`;
- `.git`;
- `agent-memory-local`;
- files containing `.local.` or ending in `.local`.

Report vulnerabilities privately through [SECURITY.md](../../SECURITY.md). Never
open a public issue containing secrets or a working exploit.
