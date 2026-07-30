# Arquitetura — como o template funciona

## Os oito pilares

```
template-claude-code-ts/
│
├── CLAUDE.md              [1] O mapa — carregado em toda sessão
│
└── .claude/
    ├── memory/            [2] A memória — o que o projeto aprendeu
    ├── specs/             [3] As specs — o estado do trabalho
    ├── skills/            [4] As skills — comportamentos sob demanda (/slash-commands)
    ├── agents/            [5] Os agentes — trabalhadores isolados
    ├── rules/             [6] As rules — contexto por caminho de arquivo
    ├── hooks/             [7] Os hooks — guardrails automáticos
    └── agent-memory/      [8] Memória persistente de agents — versionada
```

---

## 1. CLAUDE.md — o mapa de navegação

Carregado automaticamente pelo Claude Code em **toda sessão**. Por isso é mantido minimal — apenas navegação, protocolo e regra de idioma.

Contém apenas:
- O protocolo de sessão (o que ler primeiro, incluindo verificar o campo `language`)
- A regra de idioma (responde em EN ou PT-BR conforme `language` no MEMORY.md)
- O mapa de onde está cada coisa
- Princípios inegociáveis universais

As regras específicas do projeto ficam em `memory/MEMORY.md`. Regras técnicas detalhadas ficam em `rules/`.

---

## 2. memory/ — a memória persistente

Quatro arquivos com papéis distintos:

| Arquivo | Papel | Atualizado quando |
|---------|-------|-------------------|
| `MEMORY.md` | Contexto vivo do projeto (stack, regras, `language`) | Sempre que o estado muda |
| `lessons.md` | O que funcionou e o que não funcionou | Ao descobrir algo relevante |
| `decisions.md` | Decisões arquiteturais com o porquê | Antes de implementar mudanças significativas |
| `patterns.md` | Padrões eficientes específicos do projeto | Ao consolidar uma abordagem |

O front matter YAML do `MEMORY.md` contém `language: pt-br` ou `language: en` — Claude lê isso na primeira linha da sessão e adapta o idioma de toda a conversa.

**Ciclo de aprendizado:**
```
Sessão começa → Claude lê MEMORY.md (idioma) + INDEX.md
Trabalho acontece → Claude consulta lessons.md antes de decidir
Algo é descoberto → Claude atualiza lessons.md, decisions.md ou patterns.md
Próxima sessão → começa com contexto acumulado, sem repetir erros
```

---

## 3. specs/ — o estado do trabalho

**`INDEX.md`** — o painel de controle. Lido no início de toda sessão junto com `MEMORY.md`. Mostra em segundos o que está em andamento, no backlog, bloqueado e concluído.

**`[feature-slug].md`** — um arquivo por feature ou fase. Contém cinco seções-chave:

| Seção | Quando preencher | Para quê serve |
|-------|------------------|----------------|
| Critérios de aceite | Antes de implementar | Define o que é "done" — verificável e específico |
| Tarefas | Durante a implementação | Checklist de progresso |
| Como retomar | Sempre que pausar | Permite qualquer dev continuar sem briefing |
| Verificação | Ao concluir | Evidência real de que funciona (testes, comandos, resultado) |
| Notas de implementação | Continuamente | Decisões menores, gotchas, referências |

**Por que isso é poderoso para times:**
```
Dev A trabalha na feature-auth, pausa às 18h
  → atualiza "Como retomar" na spec com o estado exato

Dev B (ou nova sessão) abre o projeto às 9h do dia seguinte
  → git pull → lê INDEX.md → lê feature-auth.md → sabe exatamente por onde continuar
```

---

## 4. skills/ — comportamentos sob demanda

Skills são diretórios com um `SKILL.md` como entrypoint, carregado via `/slash-command`. Não consomem tokens até serem invocadas.

```
.claude/skills/<nome>/
├── SKILL.md        ← instruções + frontmatter YAML (obrigatório)
├── examples/       ← exemplos de output (opcional)
└── scripts/        ← scripts que Claude pode executar (opcional)
```

**Frontmatter YAML no SKILL.md:**

| Campo | Efeito |
|-------|--------|
| `name` | Cria o `/slash-command` |
| `description` | Claude usa para decidir quando carregar a skill |
| `disable-model-invocation: true` | Apenas você pode invocar — Claude não dispara automaticamente |
| `argument-hint` | Dica exibida no autocomplete (`/spec-create [nome-da-feature]`) |
| `allowed-tools` | Ferramentas disponíveis sem prompt de permissão |
| `model` | Override de modelo para esta skill |
| `context: fork` | Roda em contexto isolado de subagente |

**Skills incluídas:**

| Skill | Quando usar |
|-------|-------------|
| `/project-init` | Onboarding de projeto novo em branco |
| `/project-adopt` | Onboarding de projeto existente — descobre convenções do código |
| `/spec-create` | Cria uma spec nova para uma feature |
| `/bugfix` | Triage sistemático de bugs — reproduzir → localizar → corrigir → verificar |
| `/pr-review` | Checklist antes de abrir ou revisar PR |
| `/commit` | Formato padronizado de mensagens de commit |
| `/deploy` | Checklist e procedimento de deploy |
| `/publish-pattern` | Publica padrão reutilizável no repositório pessoal de padrões (opcional, ver "Padrões entre projetos") |

---

## 5. agents/ — trabalhadores isolados

Agentes rodam em seu próprio contexto com system prompt customizado, acesso restrito a ferramentas e permissões independentes. Claude delega para eles com base no campo `description`.

**Níveis de isolamento:**

| Configuração | Efeito |
|--------------|--------|
| `tools: Read, Glob, Grep` | Somente leitura — não modifica arquivos |
| `isolation: worktree` | Roda em worktree git temporária — seguro para operações grandes |
| `memory: project` | Escreve aprendizados em `.claude/agent-memory/<nome>/` — compartilhado com o time |
| `model: haiku` | Modelo mais rápido e econômico (bom para exploração) |

**Agents incluídos:**

| Agent | Isolamento | Memória | Propósito |
|-------|-----------|---------|-----------|
| `code-reviewer` | worktree | — | Revisa código, nunca modifica |
| `researcher` | worktree | project | Explora e acumula conhecimento do codebase |
| `planner` | — | — | Gera PRDs e specs |

---

## 6. rules/ — contexto por caminho de arquivo

Rules são arquivos markdown em `.claude/rules/` que carregam automaticamente quando Claude trabalha com arquivos correspondentes.

**Sem rules (abordagem antiga):**
```
Toda sessão: CLAUDE.md + MEMORY.md + todas as regras = custo total sempre
```

**Com rules (path-scoped):**
```
Editando componente React: carrega rules/frontend.md apenas
Editando rota de API:      carrega rules/api.md apenas
Editando migration:        carrega rules/migrations.md apenas
Editando README:           não carrega nada extra
```

**Formato:**
```markdown
---
paths:
  - "src/**/*.tsx"
  - "src/**/*.jsx"
---

# Convenções de frontend

[Regras que se aplicam apenas ao editar estes arquivos]
```

Rules sem campo `paths:` carregam incondicionalmente junto com CLAUDE.md.

---

## 7. hooks/ — guardrails automáticos

Hooks disparam automaticamente em pontos específicos do ciclo de vida. Sem invocação necessária.

**`block-destructive.sh`** (PreToolUse)
- Intercepta todo comando Bash antes de executar
- Bloqueia: `rm -rf`, `git push --force`, `DROP TABLE`, `chmod -R 777`, etc.
- Saída JSON com `permissionDecision: "deny"` — bloqueia com mensagem explicativa

**`auto-format.sh`** (PostToolUse)
- Roda após cada edição de arquivo (Edit ou Write), de forma assíncrona
- Detecta a extensão e aplica o formatador disponível
- Suporta: prettier (JS/TS), ruff/black (Python), gofmt (Go), rustfmt (Rust), shfmt (Bash)
- Falha silenciosa se o formatador não estiver instalado

**`session-end-context.sh`** (SessionEnd — opt-in)
- Auto-commita `.claude/memory/` e `.claude/specs/` ao fim de cada sessão
- Habilitado via `settings.local.json` pessoal (gitignored) — cada desenvolvedor opta individualmente
- Para ativar: `cp .claude/settings.local.json.example .claude/settings.local.json`

---

## 8. agent-memory/ — conhecimento persistente de agents

Agents com `memory: project` escrevem aprendizados em `.claude/agent-memory/<nome>/` — commitado no git e compartilhado com o time.

```
.claude/agent-memory/
└── researcher/
    ├── MEMORY.md         ← índice, lido em toda invocação do researcher
    ├── architecture.md   ← descobertas de estrutura do codebase
    └── conventions.md    ← padrões encontrados no código
```

O agente `researcher` acumula conhecimento institucional ao longo do tempo:
- Primeira invocação: explora do zero
- Invocações posteriores: lê a própria memória primeiro — responde com conhecimento acumulado
- Novo membro clona o projeto: recebe meses de exploração já feita

---

## Princípios de execução

**Stop-the-line** — ao encontrar falha inesperada:
1. Para de adicionar código
2. Preserva a evidência (log, stack trace, repro steps)
3. Re-planeja com a nova informação

Nunca empilhe código sobre um erro.

**Definition of Done** — uma tarefa só está concluída quando:
- O comportamento satisfaz os critérios de aceite da spec
- Testes passando
- A seção "Verificação" da spec tem evidência real: comando rodado + resultado

"Parece certo" não é done.

---

## Estratégia de tokens

```
Sempre carregado (toda sessão):
  CLAUDE.md              ~50 linhas
  MEMORY.md              ~20-40 linhas
  specs/INDEX.md         ~10-30 linhas
  rules/ (path matching) ~20-50 linhas por rule ativa

Carregado sob demanda:
  lessons.md             só ao consultar abordagens
  decisions.md           só ao planejar
  skills/                só ao invocar (/skill-name)
  agents/                só ao delegar
  references.md          só antes de web search
  agent-memory/          só ao rodar o agent específico
```

O `CLAUDE.md` minimal e as `rules/` por caminho mantêm o custo constante de tokens baixo ao longo de toda a vida do projeto.

---

## Adotando em projetos existentes

Para projetos com código já existente, o CLI `adopt.ts` adiciona a estrutura `.claude/` sem tocar no código:

```bash
cd meu-projeto-existente
git clone --depth=1 https://github.com/ecodelearn/template-claude-code-ts.git /tmp/cc-template
cd /tmp/cc-template && npm install && npm run build
node dist/adopt.js --tool claude --target /caminho/para/meu-projeto-existente
# ou
node dist/adopt.js --tool gemini --target /caminho/para/meu-projeto-existente
rm -rf /tmp/cc-template
```

Depois, `/project-adopt` mapeia o codebase automaticamente antes de qualquer configuração.

---

## Padrões entre projetos (opcional)

O template não depende de nenhum repositório externo para funcionar. Memória, specs e agent-memory ficam inteiramente dentro do próprio projeto, versionados com o código.

Se o usuário quiser acumular padrões reutilizáveis entre vários projetos seus, pode informar um repositório GitHub próprio (`owner/repo`) como `patterns_repo` durante `/project-init` ou `/project-adopt` — esse valor fica salvo no front matter do `MEMORY.md`. A partir daí, `/publish-pattern` publica ali; sem esse campo preenchido, a skill só registra o padrão em `.claude/memory/patterns.md` deste projeto, e nenhum repositório de terceiros é tocado.

```
<owner>/<repo do projeto>   ← este projeto (obrigatório)
  Memória, specs e agent-memory ficam aqui, versionados com o código

<owner>/<patterns_repo>     ← repositório pessoal de padrões (opcional)
  Índice de padrões reutilizáveis, definido pelo próprio usuário
  Atualizado via skill /publish-pattern, só se configurado
```
