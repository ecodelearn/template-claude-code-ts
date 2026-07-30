# Duas formas de instalar: `-open` vs `-ts`

[Português](alternatives.md) · [English](../en/alternatives.md)

Existem dois repositórios separados neste ecossistema. Escolha o que combina com o que você tem disponível e com qual agente você usa.

| | `template-claude-code-open` | `template-claude-code-ts` (este repositório) |
|---|---|---|
| Precisa de Node.js/npm | Não | Sim (Node >= 20) |
| Requisitos | Git, CLI `gh` | Git, CLI `gh`, Node.js, npm |
| Método de instalação | `git`/`gh repo clone` + script shell (`adopt.sh`) ou PowerShell (`adopt.ps1`) | `npm ci && npm run build` a partir de um checkout hoje; `npx @ecodelearn/agent-harness` quando publicado |
| Providers suportados | Claude Code (`.claude/`, `CLAUDE.md`) + um `AGENTS.md` genérico que outras ferramentas que leem AGENTS.md também aproveitam | Claude Code, Codex (`.agents/skills`), Gemini/Antigravity (`.gemini/skills`) — adaptadores específicos por provider |
| Dry-run / rollback / transações | Não — o script copia os arquivos direto | Sim — toda instalação é uma transação com `--dry-run`, `--rollback`, `--list-transactions`, `--forget` |
| Melhor para | Quem não tem Node.js, ou só precisa do Claude Code | Usuários de Codex/Gemini, ou quem quer segurança de prévia/rollback antes de mexer num projeto real |

Os dois instalam o mesmo conteúdo canônico (`.claude/`, `CLAUDE.md`, `AGENTS.md`) — os providers Claude e Codex do `-ts` buscam esse conteúdo direto do `template-claude-code-open`, fixado num commit auditado. Escolher um ou outro é sobre ferramental, não sobre receber um template diferente.

## Opção 1 — `template-claude-code-open` (sem Node.js)

**Projeto novo:**
```bash
gh repo create meu-projeto --template ecodelearn/template-claude-code-open --clone
cd meu-projeto && claude
```

**Projeto existente (Linux/Mac):**
```bash
cd meu-projeto-existente
gh repo clone ecodelearn/template-claude-code-open /tmp/cc-template -- --depth=1 --quiet && bash /tmp/cc-template/adopt.sh; rm -rf /tmp/cc-template
claude
```

**Projeto existente (Windows, PowerShell puro — sem precisar de WSL/Git Bash):**
```powershell
cd meu-projeto-existente
gh repo clone ecodelearn/template-claude-code-open $env:TEMP\cc-template -- --depth=1 --quiet
powershell -ExecutionPolicy Bypass -File "$env:TEMP\cc-template\adopt.ps1"
Remove-Item "$env:TEMP\cc-template" -Recurse -Force
claude
```

Guia completo: [github.com/ecodelearn/template-claude-code-open](https://github.com/ecodelearn/template-claude-code-open) → `QUICKSTART.md`.

## Opção 2 — `template-claude-code-ts` (este repositório, via Node.js)

Veja [Instalação e primeiro uso](getting-started.md) para o passo a passo completo (requisitos, `--dry-run`, aplicação, validação, rollback). Versão curta:

```bash
git clone https://github.com/ecodelearn/template-claude-code-ts.git
cd template-claude-code-ts
npm ci
npm run build
node dist/adopt.js --tool codex --target /caminho/para/projeto --dry-run
```

Troque `codex` por `claude` ou `gemini` conforme o agente — veja [Providers](providers.md) pra saber o que cada um configura.
