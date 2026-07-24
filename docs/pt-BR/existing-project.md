# Adoção de projeto existente

[Português](existing-project.md) · [English](../en/existing-project.md)

## Antes de começar

- trabalhe em branch própria;
- deixe o working tree limpo ou registre conscientemente as mudanças existentes;
- rode a suíte atual para criar uma linha de base;
- não use `--yes` na primeira adoção.

```bash
git switch -c chore/adopt-agent-harness
git status
```

## Prévia

```bash
node /caminho/agent-harness/dist/adopt.js \
  --tool codex \
  --target "$PWD" \
  --dry-run
```

Se já existir `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` ou `.gitignore`, o provider
preserva esses arquivos conforme sua política. Diretórios de skills/memória podem
pedir confirmação.

## Aplicação e inspeção

```bash
node /caminho/agent-harness/dist/adopt.js --tool codex --target "$PWD"
git status
git diff
```

Execute `project-adopt`. A skill deve mapear a realidade existente, sem substituir
convenções, comandos ou arquitetura por defaults genéricos.

## Rollback

```bash
node /caminho/agent-harness/dist/adopt.js \
  --target "$PWD" \
  --rollback <id>
```

O rollback remove destinos criados e restaura destinos substituídos. Ele é
vinculado ao caminho do projeto e só pode ser executado uma vez.

## Aceite

- instruções refletem os comandos reais;
- memória não contém segredos;
- build, lint e testes continuam verdes;
- diff contém apenas artefatos pretendidos;
- outro agente consegue retomar o contexto.
