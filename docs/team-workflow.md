# Workflow em time — usando o template com múltiplos desenvolvedores

> "Let the programmers be many and the managers few — then all will be productive." — Tao of Programming, 6.1

## Setup para novo membro do time

Há dois cenários distintos:

### Projeto que já usa o template (MEMORY.md preenchido)

```bash
git clone git@github.com:[owner]/[projeto].git
cd [projeto]
claude
```

Claude lê `MEMORY.md` e `specs/INDEX.md` automaticamente — o novo membro tem contexto completo em segundos. Consulte `README_MCP.md` na raiz para configurar as integrações locais necessárias.

### Projeto existente que ainda não usa o template

```bash
git clone git@github.com:[owner]/[projeto].git
cd [projeto]

# Adicionar a estrutura Claude Code
PROJECT_DIR="$(pwd)"
git clone --depth=1 https://github.com/ecodelearn/template-claude-code-ts.git /tmp/cc-template
cd /tmp/cc-template && npm install && npm run build
node dist/adopt.js --tool claude --target "$PROJECT_DIR"
# Para Gemini CLI, use:
# node dist/adopt.js --tool gemini --target "$PROJECT_DIR"
cd "$PROJECT_DIR"
rm -rf /tmp/cc-template

# Abrir o Claude Code e mapear o projeto
claude
# Execute: /project-adopt
```

`/project-adopt` usa o agente `researcher` para mapear stack, convenções e trabalho em andamento automaticamente antes de fazer qualquer pergunta. O resultado é um `MEMORY.md` preenchido com o que foi descoberto no código — sem formulário.

---

## O que é compartilhado vs. local

Entender o que fica onde evita confusão em ambientes de time.

| O quê | Local | Via git? | Notas |
|-------|-------|----------|-------|
| Contexto do projeto | `.claude/memory/` | Sim | Commite ao mudar |
| Specs de features | `.claude/specs/` | Sim | Com o código ou separado |
| Skills | `.claude/skills/` | Sim | Parte da estrutura |
| Agents | `.claude/agents/` | Sim | Parte da estrutura |
| Rules | `.claude/rules/` | Sim | Parte da estrutura |
| Memória de agent (projeto) | `.claude/agent-memory/` | Sim | Conhecimento acumulado — commite regularmente |
| Hooks | `.claude/hooks/` | Sim | Guardrails compartilhados |
| Config de hooks do time | `.claude/settings.json` | Sim | Definições para todos |
| Config pessoal de hooks | `.claude/settings.local.json` | Não — gitignored | Configurações pessoais de cada pessoa |
| Config MCP | `README_MCP.md` | Não — gitignored | Cada pessoa roda os comandos localmente |
| Auto-memória do Claude | `~/.claude/projects/<repo>/` | Não | Local da máquina, nunca commitado |
| Memória local de agent | `.claude/agent-memory-local/` | Não — gitignored | Notas pessoais de agent |
| Preferências pessoais | `CLAUDE.local.md` | Não — gitignored | Overrides individuais |

---

## Sincronização diária

Memória, specs e agent-memory são arquivos versionados junto com o código. Nenhuma infraestrutura extra necessária.

```bash
# Início de qualquer sessão — pegar o contexto mais recente do time
git pull

# Claude lê automaticamente MEMORY.md e specs/INDEX.md ao abrir

# Durante o trabalho
# Claude atualiza specs e memory ao longo da sessão

# Ao fechar a sessão — commitar o contexto acumulado
git add .claude/memory/ .claude/specs/ .claude/agent-memory/
git commit -m "chore(context): update memory/specs"
git push
```

### Opcional: auto-commit ao fim da sessão

Para habilitar commits automáticos de contexto quando o Claude Code fecha:

```bash
cp .claude/settings.local.json.example .claude/settings.local.json
```

O hook `SessionEnd` commitará `.claude/memory/` e `.claude/specs/` automaticamente. Este arquivo é gitignored — cada membro do time opta individualmente.

---

## Trabalhando em features paralelas

Dois desenvolvedores podem trabalhar em features diferentes simultaneamente sem conflito, pois cada feature tem seu próprio arquivo de spec.

```
Dev A  →  .claude/specs/feature-auth.md
Dev B  →  .claude/specs/feature-orders.md
```

O único arquivo compartilhado que pode ter conflito é `specs/INDEX.md`. A resolução é simples: num merge conflict no INDEX.md, mantenha as linhas de ambos os lados.

**Estratégia recomendada para times:**

```bash
# Ao iniciar uma feature, crie o branch e a spec juntos
git checkout -b feat/auth
# /spec-create user-authentication
git add .claude/specs/feature-auth.md .claude/specs/INDEX.md
git commit -m "docs(specs): add feature-auth spec"
git push -u origin feat/auth
```

A spec fica na branch da feature — entra no main junto com o código no merge do PR.

---

## Passagem de bastão entre sessões

O campo "Como retomar" na spec é o protocolo de handoff. **Deve ser preenchido sempre que pausar o trabalho.**

```markdown
## Como retomar este trabalho

**Estado atual:** endpoint POST /auth/login implementado e testado
**Próximo passo:** criar POST /auth/refresh em src/auth/refresh.ts — o schema já está em src/db/schema.ts:45
**Bloqueadores:** nenhum
```

Quando outro desenvolvedor (ou outra sessão) pegar a feature:
1. `git pull`
2. Claude lê `INDEX.md` → identifica a feature em andamento
3. Claude lê `feature-auth.md` → seção "Como retomar" → sabe exatamente por onde continuar

**Nenhum briefing verbal necessário.**

---

## Conhecimento compartilhado de agents

Agents com `memory: project` (atualmente o agente `researcher`) escrevem conhecimento em `.claude/agent-memory/<agent>/`. Este diretório é commitado no git.

**Efeito prático para novos membros:**

```
Novo membro clona o projeto
  → recebe o código
  → recebe MEMORY.md (contexto do projeto)
  → recebe specs (estado atual do trabalho)
  → recebe agent-memory/researcher/ (meses de exploração do codebase já feitos)

Primeira vez que rodam o agente researcher:
  → ele lê a memória acumulada primeiro
  → responde imediatamente com conhecimento profundo
  → sem re-exploração do zero
```

Commite a memória de agents regularmente junto com memória e specs:

```bash
git add .claude/memory/ .claude/specs/ .claude/agent-memory/
git commit -m "chore(context): update memory/specs/agent-knowledge"
```

---

## Conflitos em lessons.md e decisions.md

Esses arquivos crescem com entradas novas. Conflitos de merge são raros, mas quando acontecem:

- **Regra:** mantenha ambas as entradas — nunca descarte um aprendizado
- Cada entrada tem data, então é fácil identificar qual é mais recente
- Em caso de entradas contraditórias, adicione uma nota explicando a evolução

---

## Bugs encontrados durante o trabalho em time

```
/bugfix [descrição do comportamento errado]
```

A skill guia o processo: reproduzir → localizar → reduzir → corrigir → cobertura de regressão → verificar. Ao concluir, o template de documentação do fix é registrado em `lessons.md` — o time inteiro passa a conhecer o erro e como foi resolvido.

**Por que isso importa em times:** sem documentação, o mesmo bug pode ser encontrado e debugado por dois membros diferentes em momentos distintos. Com `lessons.md` atualizado, a segunda ocorrência é reconhecida imediatamente.

---

## Rules para o time

O diretório `.claude/rules/` é commitado no git — todos no time se beneficiam das regras por caminho. Ao adicionar regras para uma nova área do codebase:

1. Crie `.claude/rules/[area].md` com frontmatter `paths:`
2. Mantenha as regras específicas e acionáveis (não diretrizes vagas)
3. Commite junto com as mudanças de código que motivaram a regra

```bash
git add .claude/rules/api.md
git commit -m "docs(rules): add API validation conventions"
```

Rules carregam automaticamente — sem necessidade de pedir a Claude para "seguir as regras de API." Elas são injetadas no contexto quando Claude abre qualquer arquivo correspondente.

---

## Fluxo de PR com specs

```bash
# 1. Antes de abrir o PR
/pr-review

# 2. Spec deve estar no status "review" e INDEX.md atualizado

# 3. Após aprovação e merge do PR
# Mova a spec para status "done" e registre o link do PR no INDEX.md
```

A spec serve como fonte para a descrição do PR — tudo que os revisores precisam para entender a mudança já está escrito lá.

---

## Publicando padrões entre projetos (opcional)

Quando uma sessão descobre algo que vale para outros projetos do time:

```
/publish-pattern
```

Isso só publica algo em GitHub se o time tiver configurado um `patterns_repo` (repositório próprio, definido durante `/project-init` ou `/project-adopt`) no `MEMORY.md`. Claude formata a entrada e atualiza o índice desse repositório. Sem `patterns_repo` configurado, a skill registra o padrão apenas em `.claude/memory/patterns.md` deste projeto — nenhum repositório de terceiros é usado por padrão.

---

## Integrações MCP para o time

Após o `/project-init`, um arquivo `README_MCP.md` é criado na raiz com as integrações necessárias. Cada membro do time deve rodar os comandos listados localmente — as integrações MCP não são versionadas (ficam em `~/.claude/` de cada máquina), apenas documentadas.

Exemplo de `README_MCP.md` gerado:

```markdown
# Integrações MCP — [PROJETO]

## GitHub
claude mcp add github -- npx -y @modelcontextprotocol/server-github
Requer: GITHUB_PERSONAL_ACCESS_TOKEN no ambiente

## PostgreSQL
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres postgresql://localhost/[db]
Requer: banco local configurado
```
