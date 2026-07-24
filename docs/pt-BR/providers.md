# Providers

[Português](providers.md) · [English](../en/providers.md)

Providers traduzem a fonte canônica para o layout de cada agente.

| Provider | Instruções | Skills | Conteúdo compartilhado |
|---|---|---|---|
| Claude | `CLAUDE.md` | `.claude/skills` | `.claude/` |
| Codex | `AGENTS.md` | `.agents/skills` | `.claude/` por compatibilidade |
| Gemini | `GEMINI.md`, `AGENTS.md` | `.gemini/skills` | instalação minimalista |

## Claude

Usa `template-claude-code-open` fixado por SHA. Preserva `CLAUDE.md` e
`.gitignore` existentes. Após copiar `.claude`, ajusta permissão dos hooks shell.

## Codex

Usa a mesma fonte pública fixada. Instala `AGENTS.md` sem sobrescrever, mantém
memória/specs em `.claude/` e disponibiliza skills em `.agents/skills`, local
oficial de descoberta do Codex. Não cria `.codex/config.toml`.

## Gemini

Temporariamente usa um commit fixado deste repositório porque o adapter Gemini
ainda não foi extraído para a fonte pública. `antigravity` é alias legado.

## Garantias comuns

- nenhuma configuração global;
- nenhum MCP ativado;
- nenhuma fonte remota sem ref;
- nenhuma cópia de `.env*`, chaves, `.git`, `README_MCP.md`,
  `agent-memory-local` ou arquivos `*.local.*`;
- backup antes de substituição.

Para adicionar provider, implemente `ToolProvider`, registre-o em
`src/providers/index.ts` e adicione testes unitários e de integração.
