---
project: template-claude-code-ts
repo: ecodelearn/template-claude-code-ts
stack: TypeScript, Node.js, npm
language: pt-br
---

# Template Claude Code TS — Memória do Projeto

> Lido automaticamente a cada sessão. Mantenha conciso e atualizado.
> Última atualização: 2026-07-24

## Contexto

CLI universal para instalar e adaptar o harness público de agentes em diferentes
ferramentas. O conteúdo comum vem de `template-claude-code-open`; este projeto
concentra distribuição, segurança da instalação e providers.

## Stack

TypeScript estrito, Node.js 22, npm e Git.

## Regras não-negociáveis

- Não publicar no npm sem dry-run, backup/rollback e fonte remota versionada.
- Não copiar segredos, configuração local ou memória privada para o pacote.
- Não ativar MCPs ou integrações externas automaticamente.
- Não sobrescrever arquivos do projeto-alvo sem plano explícito.

## Estado atual

2026-07-24 — Repositório clonado na workstation em `/home/ecode/projects`.
Aberta a spec `feat-universal-installer-foundation`; planejador, `--dry-run`,
backup/rollback transacional, fontes fixadas e providers Claude/Codex/Gemini foram
implementados e testados. A cópia bloqueia memória local, `.env*`, chaves e
configurações locais. O pacote npm foi reduzido a 13 entradas por allowlist e segue
com `private: true`. A matriz CI passou em Linux, macOS e Windows no PR #1, junto
com GitGuardian. O nome npm escolhido é `@ecodelearn/agent-harness`; publicação
continua bloqueada. O workflow evita execuções duplicadas: PRs validam branches e
push valida apenas `master`. Próxima etapa é revisar o PR e planejar o rollout npm.
O hardening pós-review está no PR #2, com CI verde em Linux, macOS e Windows.

## Integrações ativas

Nenhuma. O instalador não deve ativar MCPs.
