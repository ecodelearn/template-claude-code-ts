# Agent Harness

[Português do Brasil](README.md) · [English](README.en.md)

Agent Harness is a transactional installer for a shared coding-agent workflow. It
installs the canonical content from
[template-claude-code-open](https://github.com/ecodelearn/template-claude-code-open)
— adapting it to Claude Code, Codex, and Gemini CLI — while preserving existing
files, blocking local secrets, and providing dry-run and rollback. Don't need
Node.js? Use `-open` directly: see
[Two ways to install](docs/en/alternatives.md).

> **Status:** `@ecodelearn/agent-harness` is still `private: true` and is not
> available through `npx`. Use a source checkout as described in
> [Getting started](docs/en/getting-started.md).

## What it provides

- Pinned remote sources for reproducible adoption.
- `--dry-run` before any change.
- Backups stored under the target repository's Git metadata.
- Explicit rollback, transaction listing, and backup removal.
- Repository instructions, persistent memory, specs, and reusable skills.
- Providers for Claude Code, Codex, and Gemini CLI.
- Cross-platform CI on Linux, macOS, and Windows.

## Cross-project patterns (optional)

If you keep a personal GitHub repo to accumulate reusable patterns across
projects, set `owner/repo` as `patterns_repo` during `/project-init` or
`/project-adopt`. The `/publish-pattern` skill uses that value to publish
there; without it, patterns stay in this project's `.claude/memory/patterns.md`
and no third-party repository is touched.

## Documentation

- [Installation and first use](docs/en/getting-started.md)
- [Two ways to install: -open vs -ts](docs/en/alternatives.md)
- [New projects](docs/en/new-project.md)
- [Adopting an existing project](docs/en/existing-project.md)
- [CLI reference](docs/en/cli-reference.md)
- [Providers](docs/en/providers.md)
- [Architecture and security](docs/en/architecture-security.md)
- [Contributing](CONTRIBUTING.md) · [Security policy](SECURITY.md)

## Safe preview

```bash
git clone https://github.com/ecodelearn/template-claude-code-ts.git
cd template-claude-code-ts
npm ci
npm run build
node dist/adopt.js --tool codex --target /path/to/project --dry-run
```

The target must already be a Git repository. The installer does not change global
agent settings, activate MCP servers, or publish anything.

## Future npm usage

After a separate release review removes `private: true`, the intended interface is:

```bash
npx @ecodelearn/agent-harness --tool codex --target . --dry-run
```

This command is documentation of the planned interface, not a currently available
installation method.

## License

[WTFPL v2](LICENSE)
