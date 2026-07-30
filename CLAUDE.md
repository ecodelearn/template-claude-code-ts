# [PROJECT_NAME]

> Engenheiro de software pleno. Soluções simples e diretas. Sem over-engineering.

## Protocolo obrigatório — toda sessão

1. Leia `.claude/memory/MEMORY.md` — verifique o campo `language` e use-o em TODAS as respostas desta sessão
2. Leia `.claude/specs/INDEX.md` — estado atual de todas as features/fases
3. Consulte `.claude/memory/lessons.md` antes de qualquer decisão técnica
4. Se `MEMORY.md` sem contexto → execute `/project-init` imediatamente (primeira pergunta: preferência de idioma)
5. Ao pausar ou concluir trabalho → atualize a spec correspondente e o `INDEX.md`
6. Ao descobrir algo relevante → registre em `lessons.md`, `decisions.md` ou `patterns.md`

## Regra de idioma

- Se `language: en` no MEMORY.md → responda e escreva tudo em **English**
- Se `language: pt-br` no MEMORY.md → responda e escreva tudo em **Português**
- Se o campo `language` estiver vazio ou ausente → pergunte a preferência antes de fazer qualquer coisa

## Mapa de navegação

| Preciso de | Onde está |
|------------|-----------|
| Contexto, stack e regras | `.claude/memory/MEMORY.md` |
| Estado de features e sprints | `.claude/specs/INDEX.md` |
| O que funcionou / erros a evitar | `.claude/memory/lessons.md` |
| Decisões arquiteturais e o porquê | `.claude/memory/decisions.md` |
| Padrões eficientes do projeto | `.claude/memory/patterns.md` |
| Spec de uma feature específica | `.claude/specs/[feature-slug].md` |
| Skills disponíveis e quando usar | `.claude/skills/README.md` |
| Agentes especializados | `.claude/agents/README.md` |
| Docs oficiais antes de web search | `.claude/references.md` |

> "The program should always respond to the user in the way that astonishes him least." — Lei do Menor Espanto, Tao of Programming, 4.1

## Princípios inegociáveis

- Prefira sempre a solução mais simples que resolve o problema
- Nunca repita erros documentados em `lessons.md`
- Registre decisões importantes em `decisions.md` com o porquê
- Atualize specs e `INDEX.md` ao pausar qualquer trabalho
- Código é do time — qualquer sessão deve conseguir continuar o trabalho de outra
- Antes de web search, consulte `.claude/references.md` — fontes oficiais têm prioridade
- **Sem fonte, sem afirmação:** se uma versão, flag, formato de API, data ou estatística não puder ser rastreada até `references.md`, docs oficiais ou o próprio código, diga isso em vez de arriscar um chute — um detalhe não verificado apresentado com confiança falsa é pior do que admitir a lacuna
- **Stop-the-line:** ao encontrar falha inesperada, pare, preserve evidência, re-planeje — não continue empilhando código sobre erro
- **TDD Red/Green/Refactor:** ao implementar qualquer funcionalidade, escreva o teste **antes** do código de produção (Red), implemente o mínimo para passar (Green), refatore sem quebrar (Refactor). Isso vale para toda issue, bugfix e feature — sem exceção.
- **Definition of Done:** comportamento validado + testes passando + ciclo TDD verificado + verificação documentada na spec — "parece certo" não é done
