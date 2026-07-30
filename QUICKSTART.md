# Quickstart

> Novo projeto? Siga os **Passos 1–5**.
> Projeto existente? Pule para **[Projeto existente](#projeto-existente)**.

---

## Pré-requisitos

- [Claude Code](https://github.com/anthropics/claude-code) instalado (`npm install -g @anthropic-ai/claude-code`) **ou**
- Gemini CLI instalado (comando `gemini` disponível no terminal)
- [GitHub CLI](https://cli.github.com/) autenticado (`gh auth login`)
- Git configurado

## Instalação do template (CLI local)

Se você vai usar este repositório como ferramenta de adoção, instale e gere o build:

```bash
git clone git@github.com:ecodelearn/template-claude-code-ts.git
cd template-claude-code-ts
npm install
npm run build
```

---

## Passo 1 — Criar o projeto a partir do template

```bash
gh repo create meu-projeto --template ecodelearn/template-claude-code-ts --private --clone
cd meu-projeto
```

> Se preferir clonar manualmente:
> ```bash
> git clone git@github.com:ecodelearn/template-claude-code-ts.git meu-projeto
> cd meu-projeto
> rm -rf .git && git init
> gh repo create meu-projeto --private --source=. --push
> ```

---

## Passo 2 — Abrir a ferramenta

```bash
claude
```

Ou, no Gemini CLI:

```bash
gemini
```

> O fluxo detalhado abaixo usa os comandos de onboarding do Claude (`/project-init`, `/project-adopt`).

---

## Passo 3 — Onboarding automático (/project-init)

Claude detecta que `MEMORY.md` está vazio e inicia o `/project-init` automaticamente.

Primeiro, Claude pede a **preferência de idioma** (nas duas línguas, uma única vez):

```
What language do you prefer to work in?
Qual idioma você prefere para trabalhar?

1 — English
2 — Português
```

A partir daí, tudo — perguntas, respostas, arquivos gerados — será no idioma escolhido.

Em seguida você responde **8 perguntas conversacionais** — uma por vez:

| # | Pergunta | Exemplo de resposta |
|---|----------|---------------------|
| 0 | Preferência de idioma | `2` (Português) |
| 1 | Slug e nome do projeto | `minha-api` / "API REST de pedidos B2B" |
| 1 | Repositório GitHub | `ecodelearn/minha-api` (ou em branco) |
| 2 | Stack tecnológica | Node.js + Fastify + PostgreSQL + Redis |
| 3 | Regras não-negociáveis | "Sempre PNPM, nunca alterar migrations" |
| 4 | Tamanho da equipe | "Time de 3" |
| 5 | Integrações MCP | GitHub, PostgreSQL |
| 6 | Documentação das libs | Fastify, Prisma, Vitest |
| 7 | Estado inicial | "Começando do zero" |
| 8 | Padrões entre projetos (opcional) | `owner/repo` ou vazio |

**O que é configurado e commitado automaticamente:**
- `MEMORY.md` preenchido com o contexto e idioma do projeto
- `CLAUDE.md` atualizado com o nome e regras reais
- `references.md` populado com os links das libs informadas
- `README_MCP.md` criado com instruções de setup das integrações (se houver)
- **Commit automático** do setup base — o repo já não parece mais o template

Se você respondeu a pergunta opcional sobre repositório pessoal de padrões, `patterns_repo` fica salvo no `MEMORY.md` para a skill `/publish-pattern` usar depois.

---

## Passo 4 — Criar a primeira spec

```
/spec-create feature-autenticacao-jwt
```

Claude cria `.claude/specs/feature-auth.md` e atualiza o `specs/INDEX.md`.

---

## Passo 4.5 — Publicar o setup no repositório

```
/project-seal
```

Claude revisa o que mudou, commita specs + configuração e pergunta se quer fazer push. Após isso, o repositório reflete o projeto real — não mais o template.

---

## Passo 5 — Começar a implementar

```
implemente a spec feature-auth
```

Claude lê a spec, consulta a memória e os lessons, e entrega código seguindo as regras do projeto.

> **Definition of Done:** a spec só é marcada como `done` quando o comportamento está validado, os testes passando e a seção "Verificação" da spec preenchida com evidência real. "Parece certo" não é done.

---

## Fluxo diário

```bash
# Início do dia ou sessão — pega contexto atualizado do time
git pull

# Durante o trabalho
# Claude atualiza specs e memory automaticamente ao longo da sessão

# Fim do dia — commita o contexto junto com o código
git add .claude/memory/ .claude/specs/ .claude/agent-memory/
git commit -m "chore(context): update memory/specs"
git push

# Opcional — habilitar auto-commit automático ao fechar o Claude Code:
cp .claude/settings.local.json.example .claude/settings.local.json
```

---

## Comandos úteis no Claude Code

| O que fazer | O que digitar |
|-------------|---------------|
| Iniciar nova feature | `/spec-create [nome-da-feature]` |
| Commitar setup e publicar no repo | `/project-seal` |
| Investigar e corrigir um bug | `/bugfix [descrição do bug]` |
| Revisar antes de abrir PR | `/pr-review` |
| Formatar mensagem de commit | `/commit` |
| Analisar código sem modificar | `"use o agente code-reviewer no módulo [X]"` |
| Mapear o codebase | `"use o agente researcher para [pergunta]"` |
| Planejar uma feature | `"use o agente planner para [feature]"` |
| Compartilhar padrão entre projetos | `/publish-pattern` |

---

## Projeto existente

Tem um projeto com código já existente e quer adicionar esta estrutura?

### Passo 1 — Adicionar a estrutura ao projeto

Na raiz do seu projeto existente:

```bash
git clone --depth=1 https://github.com/ecodelearn/template-claude-code-ts.git /tmp/cc-template
cd /tmp/cc-template
npm install
npm run build
node dist/adopt.js --tool claude --target /caminho/para/seu-projeto
rm -rf /tmp/cc-template
claude
```

Alternativa para Gemini CLI:

```bash
git clone --depth=1 https://github.com/ecodelearn/template-claude-code-ts.git /tmp/cc-template
cd /tmp/cc-template
npm install
npm run build
node dist/adopt.js --tool gemini --target /caminho/para/seu-projeto
rm -rf /tmp/cc-template
gemini
```

No Windows (PowerShell):

```powershell
git clone --depth=1 https://github.com/ecodelearn/template-claude-code-ts.git $env:TEMP\cc-template
Set-Location $env:TEMP\cc-template
.\adopt.ps1 -Tool claude -Target C:\caminho\para\seu-projeto
Remove-Item $env:TEMP\cc-template -Recurse -Force
Set-Location C:\caminho\para\seu-projeto
claude
```

O script adiciona o `.claude/` e o `CLAUDE.md` sem tocar no seu código.

> Se preferir manualmente:
> ```bash
> git clone --depth=1 https://github.com/ecodelearn/template-claude-code-ts.git /tmp/template
> cp -r /tmp/template/.claude .
> cp /tmp/template/CLAUDE.md .
> chmod +x .claude/hooks/*.sh
> rm -rf /tmp/template
> ```

### Passo 2 — Onboarding da ferramenta

No Claude Code:

```
/project-adopt
```

No Gemini CLI:
- siga o onboarding equivalente da própria ferramenta após abrir o projeto.

**No fluxo Claude, o que acontece:** o agente `researcher` mapeia o codebase antes de fazer qualquer pergunta — lê arquivos de configuração, git log, estrutura de diretórios e convenções existentes.

**Diferença do `/project-init`:**

| | `/project-init` | `/project-adopt` |
|--|----------------|-----------------|
| Quando usar | Projeto em branco | Projeto com código existente |
| Protocolo | Define convenções | Descobre convenções |
| Primeira ação | Faz perguntas | Mapeia o codebase |
| Specs criadas | Nenhuma (começa vazio) | Para features em andamento |

---

## Próximos passos

- Leia [docs/architecture.md](docs/architecture.md) para entender como o sistema funciona
- Leia [docs/customization.md](docs/customization.md) para adaptar skills, agents, rules e hooks ao seu projeto
- Leia [docs/team-workflow.md](docs/team-workflow.md) se estiver usando em time
