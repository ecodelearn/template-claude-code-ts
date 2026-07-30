# Agent Harness

[Português do Brasil](README.md) · [English](README.en.md)

> **Estado:** `@ecodelearn/agent-harness@1.0.0` está publicado no npm.
> ```bash
> npx @ecodelearn/agent-harness --tool codex --target . --dry-run
> ```
> Veja o [guia de início](docs/pt-BR/getting-started.md) para o passo a passo completo.

Documentação canônica em português:

- [Instalação e primeiro uso](docs/pt-BR/getting-started.md)
- [Duas formas de instalar: -open vs -ts](docs/pt-BR/alternatives.md)
- [Projeto novo](docs/pt-BR/new-project.md)
- [Adoção de projeto existente](docs/pt-BR/existing-project.md)
- [Referência do CLI](docs/pt-BR/cli-reference.md)
- [Providers](docs/pt-BR/providers.md)
- [Arquitetura e segurança](docs/pt-BR/architecture-security.md)
- [Como contribuir](CONTRIBUTING.md) · [Segurança](SECURITY.md)

Instalador transacional de um workflow compartilhado para Claude Code, Codex e
Gemini CLI. Instala o conteúdo canônico de
[template-claude-code-open](https://github.com/ecodelearn/template-claude-code-open)
— memória persistente, specs por feature, skills reutilizáveis, regras por
caminho e mecanismos de segurança — com prévia `--dry-run`, rollback
transacional e adaptadores por provider. Não precisa de Node.js? Use o
`-open` direto: veja [Duas formas de instalar](docs/pt-BR/alternatives.md).

## O problema que este template resolve

Toda vez que você abre a ferramenta de coding agent em um projeto, ela não sabe nada:
- Qual é a stack?
- Quais são as regras do time?
- O que já foi tentado e não funcionou?
- O que está sendo implementado agora?

Com este template, o agente responde tudo isso sozinho antes de você digitar a primeira mensagem.

## Como funciona

```
Primeira vez
  → Claude detecta MEMORY.md vazio → executa /project-init
  → Pergunta: "English or Português?" — você escolhe uma vez
  → Tudo (perguntas, respostas, arquivos gerados) no idioma escolhido
  → project-init commita o setup base automaticamente
  → Claude instrui: "rode /spec-create depois /project-seal"

Primeira spec
  → /spec-create [feature] — Claude cria e registra a spec
  → /project-seal — commita specs + setup e publica no repositório

Toda sessão depois
  → Claude lê MEMORY.md (contexto, regras, idioma)
  → Claude lê specs/INDEX.md (o que está em andamento)
  → Claude consulta lessons.md antes de qualquer decisão técnica
  → Rules por caminho carregam automaticamente para os arquivos sendo editados

Você pede uma feature
  → /planner cria um plano formal antes de codar
  → /spec-create registra a spec
  → Implementa seguindo as regras do projeto
  → Registra o que aprendeu para as próximas sessões

Outro dev (ou outra sessão) pega o trabalho
  → git pull → contexto + memória de agents atualizada
  → Continua exatamente de onde parou — sem briefing
```

## Início rápido

**Projeto novo:**
```bash
gh repo create meu-projeto --template ecodelearn/template-claude-code-ts --private --clone
cd meu-projeto && claude
# Claude detecta MEMORY.md vazio e inicia /project-init automaticamente
```

**Projeto existente:**
```bash
cd meu-projeto-existente
git clone --depth=1 https://github.com/ecodelearn/template-claude-code-ts.git /tmp/cc-template \
  && cd /tmp/cc-template \
  && npm install \
  && npm run build \
  && node dist/adopt.js --tool claude --target /caminho/para/meu-projeto-existente \
  && rm -rf /tmp/cc-template
claude
# Execute: /project-adopt — Claude mapeia o codebase antes de perguntar qualquer coisa
```

**Projeto existente (Gemini CLI):**
```bash
cd meu-projeto-existente
git clone --depth=1 https://github.com/ecodelearn/template-claude-code-ts.git /tmp/cc-template \
  && cd /tmp/cc-template \
  && npm install \
  && npm run build \
  && node dist/adopt.js --tool gemini --target /caminho/para/meu-projeto-existente \
  && rm -rf /tmp/cc-template
gemini
```

→ **[Guia completo: QUICKSTART.md](QUICKSTART.md)**

## Instalação por tipo de CLI

Via npm (publicado):

```bash
# Prévia segura — não altera o projeto
npx @ecodelearn/agent-harness --tool claude --target /caminho/para/projeto --dry-run

# Aplicação transacional — imprime um ID para rollback
npx @ecodelearn/agent-harness --tool claude --target /caminho/para/projeto

# Restaura uma instalação específica
npx @ecodelearn/agent-harness --target /caminho/para/projeto --rollback <id>
```

Alternativa via checkout do repositório:

```bash
git clone git@github.com:ecodelearn/template-claude-code-ts.git
cd template-claude-code-ts
npm install
npm run build

node dist/adopt.js --tool claude --target /caminho/para/projeto --dry-run
node dist/adopt.js --tool claude --target /caminho/para/projeto
node dist/adopt.js --target /caminho/para/projeto --rollback <id>
```

### Claude Code

```bash
# uso direto
node dist/adopt.js --tool claude --target /caminho/para/projeto

# ou via script npm
npm run adopt -- --tool claude --target /caminho/para/projeto
```

### Codex

```bash
node dist/adopt.js --tool codex --target /caminho/para/projeto --dry-run
node dist/adopt.js --tool codex --target /caminho/para/projeto
```

O provider preserva `AGENTS.md` existente, instala skills em `.agents/skills` e
não altera configuração global, `.codex/config.toml` ou MCPs.

### Gemini CLI

```bash
# uso direto
node dist/adopt.js --tool gemini --target /caminho/para/projeto

# ou via script npm
npm run adopt -- --tool gemini --target /caminho/para/projeto
```

## Estrutura

```
template-claude-code-ts/
├── CLAUDE.md                         # Mapa de navegação, protocolo e regra de idioma
├── QUICKSTART.md                     # Guia de 5 minutos
├── adopt.sh                          # Script legado de adoção (Claude)
├── adopt.ps1                         # Wrapper PowerShell (Windows)
├── src/adopt.ts                      # CLI universal em TypeScript (providers por tool)
├── docs/
│   ├── architecture.md               # Como o sistema funciona por dentro
│   ├── customization.md              # Como adaptar ao seu projeto
│   └── team-workflow.md              # Uso em times remotos
└── .claude/
    ├── settings.json                 # Hooks compartilhados (PreToolUse + PostToolUse)
    ├── settings.local.json.example   # Template para hooks pessoais (opt-in, gitignored)
    ├── skills/                       # /slash-commands
    │   ├── project-init/SKILL.md     # Onboarding — projeto novo em branco
    │   ├── project-seal/SKILL.md     # Fecha setup — commita specs e publica no repositório
    │   ├── project-adopt/SKILL.md    # Onboarding — projeto existente (descobre convenções)
    │   ├── spec-create/SKILL.md      # Cria spec para nova feature ou fase
    │   ├── bugfix/SKILL.md           # Triage sistemático de bugs (reproduzir→fix→verificar)
    │   ├── pr-review/SKILL.md        # Checklist de abertura e revisão de PR
    │   ├── commit/SKILL.md           # Formato padronizado de mensagens de commit
    │   ├── deploy/SKILL.md           # Checklist e procedimento de deploy
    │   └── publish-pattern/SKILL.md  # Publica padrão reutilizável no índice global
    ├── agents/
    │   ├── code-reviewer.md          # Revisa código sem modificar nada (sonnet, worktree)
    │   ├── researcher.md             # Explora repositórios (haiku, worktree, project memory)
    │   └── planner.md                # Gera PRDs e planos antes de qualquer código (sonnet)
    ├── hooks/
    │   ├── block-destructive.sh      # Bloqueia rm -rf, force push, DROP TABLE, etc
    │   ├── auto-format.sh            # Formata automaticamente após edições (async)
    │   └── session-end-context.sh    # Auto-commita memory/specs ao fim da sessão (opt-in)
    ├── rules/
    │   ├── _example-frontend.md      # Template: regras para arquivos React/TS
    │   └── _example-api.md           # Template: regras para API/backend
    ├── memory/
    │   ├── MEMORY.md                 # Contexto vivo do projeto (lido toda sessão)
    │   ├── lessons.md                # O que funcionou e o que não funcionou
    │   ├── decisions.md              # Decisões arquiteturais com o porquê
    │   └── patterns.md               # Padrões eficientes específicos do projeto
    ├── agent-memory/                 # Conhecimento acumulado de agents — versionado
    ├── specs/
    │   ├── INDEX.md                  # Painel de controle — estado de todas as features
    │   └── _template.md              # Template para criar novas specs
    └── references.md                 # Documentação oficial para consulta antes de web search
```

## Skills disponíveis

| Skill | Quando invocar |
|-------|----------------|
| `/project-init` | Projeto novo — onboarding automático |
| `/project-seal` | Após project-init + primeira spec — commita e publica |
| `/project-adopt` | Projeto existente — mapeia codebase e configura |
| `/spec-create [feature]` | Iniciar nova feature |
| `/bugfix [descrição]` | Investigar e corrigir bug |
| `/pr-review` | Antes de abrir ou revisar PR |
| `/commit` | Formatar mensagem de commit |
| `/deploy` | Antes de qualquer deploy |
| `/publish-pattern` | Compartilhar padrão com outros projetos |

## Regras por caminho (rules/)

Arquivos em `.claude/rules/` com frontmatter `paths:` carregam automaticamente apenas quando Claude trabalha com arquivos correspondentes — economizando contexto e mantendo as regras focadas.

```
Editando componente React: carrega rules/frontend.md apenas
Editando rota de API:      carrega rules/api.md apenas
Editando README:           não carrega nada extra
```

## Agents disponíveis

| Agent | Quando invocar |
|-------|----------------|
| `code-reviewer` | `"use o agente code-reviewer no módulo [X]"` |
| `researcher` | `"use o agente researcher para [pergunta]"` |
| `planner` | `"use o agente planner para [feature]"` |

## Sincronização em times remotos

Memória, specs e agent-memory são arquivos versionados normalmente — sem infraestrutura extra.

```bash
# Início de sessão
git pull

# Fim de sessão
git add .claude/memory/ .claude/specs/ .claude/agent-memory/
git commit -m "chore(context): update memory/specs"
git push

# Opcional — habilitar auto-commit ao fim da sessão:
cp .claude/settings.local.json.example .claude/settings.local.json
```

→ **[Guia completo para times: docs/team-workflow.md](docs/team-workflow.md)**

## Padrões entre projetos (opcional)

Se você mantém um repositório pessoal para acumular padrões reutilizáveis entre projetos, informe `owner/repo` como `patterns_repo` durante `/project-init` ou `/project-adopt`. A skill `/publish-pattern` usa esse valor para publicar lá; sem ele, os padrões ficam apenas em `.claude/memory/patterns.md` deste projeto.

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [QUICKSTART.md](QUICKSTART.md) | Do zero ao primeiro código em 5 minutos |
| [docs/universal-adopt.md](docs/universal-adopt.md) | CLI universal em TypeScript para adoção por provider |
| [docs/dev-pipeline.md](docs/dev-pipeline.md) | Pipeline de 7 estágios aplicado ao template |
| [docs/architecture.md](docs/architecture.md) | Como o sistema funciona por dentro |
| [docs/customization.md](docs/customization.md) | Como adaptar skills, agents, rules e hooks |
| [docs/team-workflow.md](docs/team-workflow.md) | Workflow para times remotos |
