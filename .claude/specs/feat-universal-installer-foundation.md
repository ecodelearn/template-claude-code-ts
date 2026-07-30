# Spec: Universal installer foundation

**Status:** `in-progress`
**Slug:** `template-claude-code-ts::feat-universal-installer-foundation`
**Criado em:** 2026-07-24
**Última atualização:** 2026-07-24

---

## Objetivo

Transformar este repositório na camada universal de instalação do harness de agentes,
executável via `npx` em macOS, Linux e Windows, com suporte progressivo a Codex,
Claude Code e Gemini CLI.

O `template-claude-code-open` passa a ser a fonte canônica pública do conteúdo
universal. Este repositório mantém o instalador, os adaptadores por agente e somente
as diferenças que dependem do canal de instalação.

## Requisitos de segurança

- Toda mudança no projeto-alvo deve poder ser inspecionada com `--dry-run`.
- Nenhum arquivo existente pode ser removido sem aparecer no plano.
- A execução real deve ganhar backup/rollback antes da publicação no npm.
- Fontes remotas devem ser fixadas por versão ou commit antes da publicação.
- Segredos e memória local (`README_MCP.md`, `.env*`, `*.local.*`,
  `.claude/agent-memory-local/`) nunca entram no pacote.
- MCPs e integrações externas não são ativados automaticamente pelo instalador.

## Arquitetura-alvo

1. `template-claude-code-open`: conteúdo universal, documentação e protocolo.
2. `template-claude-code-ts`: CLI, resolução de versões e providers por agente.
3. Snapshot versionado ou release do conteúdo canônico: entrada reproduzível do CLI.
4. Providers: traduzem o conteúdo universal para cada harness sem duplicar a fonte.

## Design da transação

- Backups ficam dentro do diretório Git real, em
  `.git/adopt-cli/transactions/<id>`, portanto não entram no working tree.
- Cada transação guarda `manifest.json`, cópias dos destinos substituídos e a lista
  dos destinos criados.
- Falha durante cópia ou `afterCopy` dispara rollback automático.
- `--rollback <id>` restaura explicitamente uma transação concluída.
- Destinos absolutos ou com travessia (`..`) são rejeitados antes de qualquer escrita.

## Design da fonte versionada

- Providers remotos declaram `defaultSource` e `defaultRef`.
- `--ref` permite selecionar explicitamente tag ou commit para uma fonte remota.
- O fetch faz checkout destacado da referência solicitada e registra o commit
  resolvido.
- Fontes locais continuam permitidas para desenvolvimento, sem checkout ou mutação.
- Enquanto o conteúdo específico de Gemini não for extraído como adapter, seu
  provider permanece temporariamente fixado ao commit auditado deste repositório.

## Fora do escopo desta etapa

- Publicar no npm.
- Instalar ou configurar MCPs.
- Migrar memórias privadas para o repositório público.
- Suporte completo a todos os agentes em um único incremento.
- Remover o template privado legado antes de validar a migração.

## Critérios de aceite da fundação

- `--dry-run` lista cópias, sobrescritas, preservações e arquivos ausentes.
- O modo de prévia não escreve nem remove arquivos e não executa `afterCopy`.
- O comportamento do planejador tem testes automatizados.
- README e ajuda documentam a prévia.
- A decisão entre fonte canônica e instalador fica registrada.

## Tarefas

- [x] Comparar `template-claude-code-open` e `template-claude-code-ts`.
- [x] Registrar a arquitetura fonte canônica + instalador.
- [x] Extrair um planejador puro para as regras de cópia.
- [x] Implementar `--dry-run`.
- [x] Cobrir o planejador com testes.
- [x] Documentar uso e limitações atuais.
- [x] Projetar e implementar backup/rollback.
- [x] Fixar fontes remotas por commit e exigir `--ref` em fontes personalizadas.
- [x] Bloquear cópia de memória local, segredos e chaves.
- [x] Adicionar provider Codex após validar o layout oficial atual.
- [x] Restringir o artefato npm com allowlist e manter publicação bloqueada.
- [x] Adicionar listagem e exclusão explícita de backups.
- [x] Criar teste de integração sem dependência de Bash.
- [x] Criar matriz CI para Linux, macOS e Windows com Actions fixadas por SHA.
- [x] Executar e validar a primeira matriz CI no GitHub.
- [x] Definir nome público: `@ecodelearn/agent-harness`.
- [ ] Validar acesso ao escopo npm e preparar publicação via `npx`.

## Verificação

- `npm test`
- Teste manual contra repositório temporário, comparando o filesystem antes/depois
  de `--dry-run`.

Resultado em 2026-07-24: build TypeScript e testes passaram; o teste manual exibiu
`filesystem_unchanged=yes`. O round-trip de aplicação + rollback exibiu
`transaction_roundtrip=yes`. O teste remoto resolveu exatamente
`758fc59ac15fddcd459f3dc2c212f57e36cbd6bd` e terminou com
`versioned_remote_dry_run=yes`. O ciclo Codex instalou `AGENTS.md` e
`.agents/skills`, bloqueou memória local, listou/restaurou/removeu a transação e
terminou com `codex_lifecycle=yes`. `npm pack --dry-run` foi reduzido de 81 para
13 entradas, sem specs, memórias, fontes ou testes internos.

Em 2026-07-24 foi adicionada a matriz GitHub Actions:

- Ubuntu + Node 20
- Ubuntu + Node 22
- macOS + Node 20
- Windows + Node 20

O teste de integração em Node puro cobre instalação Codex, exclusão de arquivos
locais sensíveis, listagem da transação, rollback, remoção do backup e `dry-run`.
Localmente, as 5 suítes passaram. No PR #1, a matriz passou em Ubuntu com Node
20/22, macOS com Node 20 e Windows com Node 20; GitGuardian também passou.
Após a primeira execução duplicada, o gatilho foi otimizado: `pull_request` valida
branches e `push` executa somente em `master`.

## Candidatos de nome npm

Consulta somente-leitura em 2026-07-24 retornou `E404` para os três nomes abaixo,
indicando que não há pacote público visível com esses nomes:

1. `@ecodelearn/agent-harness` — **escolhido em 2026-07-24**; descreve o produto
   sem vinculá-lo a um único agente.
2. `@ecodelearn/spec-harness` — enfatiza specs, mas comunica menos sobre instalação.
3. `ecode-specs` — curto e sem escopo, porém mais genérico.

Um `E404` em pacote com escopo não confirma permissão para publicar no namespace
`@ecodelearn`; essa autorização só deve ser verificada depois da escolha.

Referência oficial consultada em 2026-07-24:
- `AGENTS.md`: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Skills: https://learn.chatgpt.com/docs/build-skills

## Hardening pós-review do PR #1

O PR #1 foi mesclado antes da chegada de quatro comentários do Copilot. Correções
abertas em branch complementar:

- [x] Bloquear `.envrc` e qualquer basename iniciado por `.env`.
- [x] Validar todos os destinos antes de criar estado transacional ou escrever.
- [x] Tipar `operations` explicitamente como `CopyOperation[]`.
- [x] Restaurar `language: pt-br` no front matter de `MEMORY.md`.
- [x] Validar CI multiplataforma do PR complementar #2.

## Checklist de release candidate — 2026-07-30

Executado localmente contra o tarball empacotado (`npm pack`), simulando uma
instalação real via `npx`, com o provider Codex e um repositório git de teste:

- [x] **Tarball**: `npm pack` gera 28 arquivos, extraído e executado como pacote
  instalado — sem depender do checkout de desenvolvimento.
- [x] **Instalação real** (`--yes`, sem `--dry-run`): copia `AGENTS.md`,
  `.claude`, `.agents/skills`, `.gitignore`; registra transação com ID e comando
  de rollback.
- [x] **Update/conflito**: após editar `AGENTS.md` localmente, nova execução em
  `--dry-run` mostra `[PRESERVAR]` para `AGENTS.md`/`.gitignore` (overwrite:
  never) e `[PERGUNTAR]` para `.claude`/`.agents/skills` (overwrite: prompt) —
  comportamento correto, nada sobrescrito silenciosamente.
- [x] **Rollback** (`--rollback <id>`): restaura o estado exato de antes da
  instalação — `AGENTS.md`, `.claude`, `.agents`, `.gitignore` removidos,
  `README.md` original intacto.
- [x] **Desinstalação**: não existe um comando `--uninstall` dedicado — o fluxo
  é `--rollback` (remove o que foi adicionado) seguido de `--forget` (apaga o
  backup). Testado e funcionou; vale documentar esse fluxo explicitamente no
  README/CLI reference, já que "uninstall" não aparece literal no `--help`.

**Atualização 2026-07-30, resolvida:** a PR #4 (aberta de
`agent/bilingual-public-docs`) nunca disparou CI porque a branch tinha
divergido do `master` antes do squash-merge da PR #3 — o `merge-base` que o
GitHub usava ainda era o commit anterior àquele squash, então o diff mostrava
38 arquivos e `mergeable: CONFLICTING`. Fechada e substituída pela PR #5,
cortada direto do `master` atual com só o commit real (`cherry-pick`) — diff
de 13 arquivos, `mergeable: MERGEABLE`, `mergeStateStatus: CLEAN`. A matriz
completa rodou e passou: `windows-latest/Node20`, `ubuntu-latest/Node20`,
`ubuntu-latest/Node22`, `ubuntu-latest/Node24`, `macos-latest/Node20`, além do
GitGuardian. **Windows/macOS/Linux estão validados para este commit.**

**Pendências que ainda ficam em aberto:**

- **Acesso ao escopo npm `@ecodelearn`.** `npm whoami` confirmou login como
  `ecodelearn` em 2026-07-30, mas acesso de publish ao escopo (`npm access` ou
  uma tentativa real de `publish`) ainda não foi testado.
- Só o provider Codex foi exercitado ponta a ponta neste checklist; os demais
  (Claude, Gemini/Antigravity) compartilham o mesmo motor de transação já
  coberto pelos testes automatizados, mas não foram re-testados manualmente
  aqui.
