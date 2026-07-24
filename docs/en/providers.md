# Providers

[Português](../pt-BR/providers.md) · [English](providers.md)

Providers adapt the canonical source to each agent layout.

| Provider | Instructions | Skills | Shared content |
|---|---|---|---|
| Claude | `CLAUDE.md` | `.claude/skills` | `.claude/` |
| Codex | `AGENTS.md` | `.agents/skills` | `.claude/` for compatibility |
| Gemini | `GEMINI.md`, `AGENTS.md` | `.gemini/skills` | minimal installation |

## Claude

Uses `template-claude-code-open` pinned by SHA. Existing `CLAUDE.md` and
`.gitignore` are preserved. Copied shell hooks receive executable permissions.

## Codex

Uses the same pinned public source. It preserves an existing `AGENTS.md`, keeps
memory/specs under `.claude/`, and exposes skills under the official
`.agents/skills` discovery path. It does not create `.codex/config.toml`.

## Gemini

Temporarily uses a pinned commit from this repository because the Gemini adapter
has not yet been extracted into the public source. `antigravity` remains a legacy
alias.

## Shared guarantees

- no global configuration changes;
- no MCP activation;
- no unpinned remote source;
- no `.env*`, private keys, `.git`, `README_MCP.md`, `agent-memory-local`, or
  `*.local.*` copies;
- backup before replacement.

To add a provider, implement `ToolProvider`, register it in
`src/providers/index.ts`, and add unit and integration coverage.
