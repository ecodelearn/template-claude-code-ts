# Decisões Arquiteturais

> Registre ANTES de implementar decisões significativas. Consulte antes de refatorar ou propor mudanças de arquitetura.

<!--
FORMATO DE ENTRADA:

## [Título da decisão] — YYYY-MM-DD
**Contexto:** por que essa decisão foi necessária
**Decisão:** o que foi escolhido
**Alternativas descartadas:** o que foi considerado e por que não foi escolhido
**Consequências:** impactos esperados (positivos e negativos)
**Status:** ativa | substituída por [link]
-->

<!-- Adicione entradas aqui -->

## Documentação pública sempre em PT-BR e inglês — 2026-07-24
**Contexto:** O Agent Harness pretende ser adotado fora do ambiente pessoal, por
usuários de diferentes agentes e sistemas operacionais.
**Decisão:** Landing pages e guias públicos canônicos devem existir em pares
`docs/pt-BR` e `docs/en`. Mudanças de comportamento público só estão completas
quando ambos os idiomas e os testes de paridade/links forem atualizados.
**Alternativas descartadas:** documentação apenas em português; tradução automática
sem revisão; um único arquivo longo intercalando idiomas.
**Consequências:** todo PR público tem custo de manutenção bilíngue, mas navegação,
contribuição e adoção ficam previsíveis. Documentos internos de memória/spec não
precisam ser traduzidos.
**Status:** ativa

## Provider Codex sem configuração ou MCP automático — 2026-07-24
**Contexto:** A documentação oficial atual diferencia orientação persistente em
`AGENTS.md`, skills de repositório em `.agents/skills` e configuração confiável em
`.codex/config.toml`.
**Decisão:** O provider Codex instala `AGENTS.md`, mantém os artefatos compartilhados
do protocolo em `.claude/` por compatibilidade e espelha skills em
`.agents/skills`. Não cria `.codex/config.toml`, não toca configuração global e não
ativa MCPs.
**Alternativas descartadas:** instalar configuração Codex opinativa; copiar skills
somente para `.claude/skills`, onde o Codex não as descobre oficialmente; converter
todo o namespace compartilhado no primeiro incremento.
**Consequências:** existe duplicação temporária das skills entre `.claude/skills` e
`.agents/skills`. A fonte canônica deverá evoluir para separar protocolo comum de
adapters por harness.
**Status:** ativa

## Backups dentro do diretório Git — 2026-07-24
**Contexto:** O instalador precisa substituir árvores como `.claude` sem perder o
estado anterior e sem colocar cópias potencialmente sensíveis no working tree.
**Decisão:** Cada aplicação cria uma transação em
`.git/adopt-cli/transactions/<id>`, com manifesto, backup e rollback explícito.
Falhas durante cópia ou pós-processamento restauram automaticamente o estado
anterior. O manifesto é vinculado ao caminho absoluto do projeto para impedir que
um rollback forjado atinja outro diretório.
**Alternativas descartadas:** backup dentro do working tree; backup apenas em `/tmp`;
sobrescrita sem recuperação.
**Consequências:** os backups sobrevivem a commits e não são versionados, mas podem
ocupar espaço e conter configurações anteriores; uma política de listagem e limpeza
segura deverá ser adicionada antes da publicação.
**Status:** ativa

## Template público canônico com instalador universal separado — 2026-07-24
**Contexto:** O ecossistema mantinha três variantes com conteúdo parcialmente
duplicado. O `template-claude-code-open` é hoje a variante pública que deve continuar
funcional, enquanto este repositório já concentra a engenharia multi-harness.
**Decisão:** Usar `template-claude-code-open` como fonte canônica do conteúdo
universal e `template-claude-code-ts` como instalador/adaptador distribuível via
`npx`. Diferenças por agente devem viver em providers; o conteúdo comum não deve ser
mantido manualmente em múltiplas cópias. Até existir resolução de release e
backup/rollback, o CLI continua não publicável.
**Alternativas descartadas:** transformar o repositório público em CLI; manter os
três templates sincronizados manualmente; usar o template privado como fonte remota
padrão de uma ferramenta pública.
**Consequências:** será necessária uma etapa de empacotamento ou download versionado
do conteúdo público. As extensões exclusivas deste repositório precisam ser
classificadas como provider, extensão opcional ou removidas antes da publicação.
**Status:** ativa

## Não portar `git-commit-formatter` e `license-header-adder` para os repos irmãos — 2026-07-06
**Contexto:** Ao mapear o gap entre os 3 templates (spec `chore-sync-template-ecosystem`), essas 2 das 5 skills exclusivas do `-ts` pareciam genéricas o bastante para virar universais (privado + `-open`), ao contrário das outras 3 (`adk-tool-scaffold`, `database-schema-validator`, `json-to-pydantic`), que são nichadas o suficiente para ficar só aqui.
**Decisão:** Não portar nenhuma das duas.
- `git-commit-formatter` duplica a skill `commit` que já existe em `template-claude-code`/`template-claude-code-open` — mesmo Conventional Commits, mesma finalidade, nomes diferentes. Portar criaria duas skills fazendo a mesma coisa, violando o próprio princípio "prefira sempre a solução mais simples" que o template exige do código que ele orienta.
- `license-header-adder` conflita com a filosofia de licença do próprio ecossistema: os 3 repos usam WTFPL v2, uma licença que existe justamente pra eliminar cerimônia de copyright/header. Adicionar uma skill que insere headers de licença formais é o oposto do que o template pratica.
**Alternativas descartadas:** Portar as duas como estão; renomear `git-commit-formatter` pra consolidar com `commit`.
**Consequências:** As 5 skills exclusivas do `-ts` continuam exclusivas — nenhuma mudança nos outros 2 repos. Se o `-ts` quiser eliminar a duplicação interna (`commit` vs `git-commit-formatter`), isso é uma limpeza separada, fora desta spec.
**Status:** ativa
