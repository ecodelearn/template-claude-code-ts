---
name: publish-pattern
description: Publica um padrão reutilizável no repositório pessoal de padrões do usuário, se houver um configurado. Use quando uma solução se provar genuinamente reutilizável em outros projetos.
disable-model-invocation: true
---

# Skill: publish-pattern

**Quando usar:** Quando uma solução se provar genuinamente reutilizável em outros projetos. Use com critério — só o que realmente economizaria tempo ou evitaria erros em um contexto diferente.

**Exige configuração:** esta skill só mexe em GitHub se `patterns_repo` estiver preenchido no front matter de `.claude/memory/MEMORY.md` (opcional, definido em `project-init` ou `project-adopt`). Se estiver vazio, pule direto para "Fallback local" abaixo — nunca clone, crie ou dê push em um repositório que o usuário não indicou.

---

## Critérios para publicar

Publique se a solução:
- Resolveu um problema não óbvio
- É independente do contexto específico deste projeto
- Economizaria tempo ou evitaria erros em outro projeto

Não publique:
- Soluções muito específicas do domínio do negócio
- Workarounds temporários
- O que já está no índice

---

## Formato da entrada

```markdown
### [Nome do Padrão] — [data]
**Origem:** `[project-slug]`
**Problema:** [o que resolvia — 1 frase]
**Solução:** [a abordagem — 2-3 frases]
**Por que funciona:** [raciocínio curto]
**Reutilizável quando:** [condições ou contexto]
**Detalhes:** [link para o arquivo no repo de origem]
```

---

## Fallback local (`patterns_repo` vazio)

Adicione a entrada acima em `.claude/memory/patterns.md` deste projeto (crie o arquivo se não existir) e informe ao usuário: "Nenhum `patterns_repo` configurado — registrado apenas localmente em `patterns.md`." Pare aqui.

---

## Protocolo de execução (`patterns_repo` configurado)

### Passo 0 — Ler o repositório configurado

Leia `patterns_repo` no front matter de `.claude/memory/MEMORY.md` (formato `owner/repo`).

### Passo 1 — Sincronizar o clone local

Caminho do clone local: `~/.claude/patterns-repo/`

**Se ainda não existir:**
```bash
git clone https://github.com/<patterns_repo> ~/.claude/patterns-repo/
```

**Se já existir:**
```bash
cd ~/.claude/patterns-repo && git pull origin main
```

Não tente recuperar um diretório que exista mas não seja git nesse caminho — se `git pull` falhar por isso, avise o usuário e pare; é o estado local dele para resolver, não desta skill.

### Passo 2 — Ler o slug do projeto atual

Leia `.claude/memory/MEMORY.md` para confirmar `project`.

### Passo 3 — Editar o índice

Abra `~/.claude/patterns-repo/global-index.md` (ou o arquivo de índice que o repositório do usuário realmente usar — confira o README dele se `global-index.md` não existir). Anote o caminho real do arquivo editado — é o mesmo que vai para o commit no próximo passo.

Adicione a entrada na seção de categoria correspondente. Se a categoria não existir, crie com `### [Categoria]`.

Atualize a data de "última atualização" no topo do arquivo.

### Passo 4 — Commit e push

Use o caminho real do arquivo editado no Passo 3 (não assuma `global-index.md` se o repositório do usuário usar outro nome):

```bash
cd ~/.claude/patterns-repo
git add <arquivo-de-índice-real>
git commit -m "docs(patterns): add [nome] from [project-slug]"
git push origin main
```

### Passo 5 — Registrar localmente também

Adicione também uma nota em `.claude/memory/patterns.md` do projeto atual, referenciando o padrão publicado.

---

## Exemplo de entrada publicada

```markdown
### Cursor Pagination em tabelas grandes — 2026-03-04
**Origem:** `minha-api`
**Problema:** Offset pagination causava degradação de performance com >50k registros
**Solução:** Cursor baseado em `(created_at, id)` com índice composto — evita full scan
**Por que funciona:** O banco filtra a partir de um ponto fixo em vez de pular N linhas
**Reutilizável quando:** Qualquer endpoint com paginação em tabela de alto volume
**Detalhes:** `<owner>/minha-api` → `.claude/memory/lessons.md#cursor-pagination`
```

---

## Erros comuns

| Erro | Causa | Fix |
|------|-------|-----|
| `not a git repository` | `~/.claude/patterns-repo/` existe mas não é um clone git | Avise o usuário; não faça `git init` automático num histórico que não é seu |
| `Permission denied` | Sem autenticação GitHub configurada para aquele repo | Peça pro usuário checar as credenciais `gh`/git — não é problema desta skill resolver |
| `rejected — non-fast-forward` | Repo remoto tem commits não puxados | `git pull --rebase origin main` antes do push |
| arquivo de índice não encontrado | Repo clonado mas sem `global-index.md` | Pergunte ao usuário qual arquivo/formato o repo dele realmente usa antes de inventar um |
