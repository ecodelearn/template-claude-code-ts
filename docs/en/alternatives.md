# Two ways to install: `-open` vs `-ts`

[Português](../pt-BR/alternatives.md) · [English](alternatives.md)

There are two separate repositories in this ecosystem. Pick the one that fits what you have available and which agent you use.

| | `template-claude-code-open` | `template-claude-code-ts` (this repo) |
|---|---|---|
| Requires Node.js/npm | No | Yes (Node >= 20) |
| Requires | Git, `gh` CLI | Git, `gh` CLI, Node.js, npm |
| Install method | `git`/`gh repo clone` + a shell (`adopt.sh`) or PowerShell (`adopt.ps1`) script | `npx @ecodelearn/agent-harness` (published on npm) |
| Providers supported | Claude Code (`.claude/`, `CLAUDE.md`) + a generic `AGENTS.md` other AGENTS.md-reading tools can pick up | Claude Code, Codex (`.agents/skills`), Gemini/Antigravity (`.gemini/skills`) — provider-specific adapters |
| Dry-run / rollback / transactions | No — the script copies files directly | Yes — every install is a transaction with `--dry-run`, `--rollback`, `--list-transactions`, `--forget` |
| Best for | Anyone without Node.js, or who only needs Claude Code | Codex/Gemini users, or anyone who wants preview/rollback safety before touching a real project |

Both install the same canonical content (`.claude/`, `CLAUDE.md`, `AGENTS.md`) — `-ts`'s Claude and Codex providers fetch it directly from `template-claude-code-open`, pinned to an audited commit. Picking one over the other is about tooling, not about getting a different template.

## Option 1 — `template-claude-code-open` (no Node.js required)

**New project:**
```bash
gh repo create my-project --template ecodelearn/template-claude-code-open --clone
cd my-project && claude
```

**Existing project (Linux/Mac):**
```bash
cd my-existing-project
gh repo clone ecodelearn/template-claude-code-open /tmp/cc-template -- --depth=1 --quiet && bash /tmp/cc-template/adopt.sh; rm -rf /tmp/cc-template
claude
```

**Existing project (Windows, PowerShell native — no WSL/Git Bash needed):**
```powershell
cd my-existing-project
gh repo clone ecodelearn/template-claude-code-open $env:TEMP\cc-template -- --depth=1 --quiet
powershell -ExecutionPolicy Bypass -File "$env:TEMP\cc-template\adopt.ps1"
Remove-Item "$env:TEMP\cc-template" -Recurse -Force
claude
```

Full guide: [github.com/ecodelearn/template-claude-code-open](https://github.com/ecodelearn/template-claude-code-open) → `QUICKSTART.md`.

## Option 2 — `template-claude-code-ts` (this repo, via Node.js)

See [Installation and first use](getting-started.md) for the full walkthrough (requirements, `--dry-run`, applying, validating, rollback). Short version:

```bash
npx @ecodelearn/agent-harness --tool codex --target /path/to/project --dry-run
```

Replace `codex` with `claude` or `gemini` depending on your agent — see [Providers](providers.md) for what each one sets up.
