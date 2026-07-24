# Projeto novo

[Português](new-project.md) · [English](../en/new-project.md)

## 1. Crie o repositório

```bash
mkdir meu-projeto
cd meu-projeto
git init
```

Adicione o código inicial ou um README antes da adoção, se desejar.

## 2. Execute a prévia

A partir do checkout compilado do Agent Harness:

```bash
node /caminho/agent-harness/dist/adopt.js \
  --tool codex \
  --target "$PWD" \
  --dry-run
```

## 3. Aplique o provider

```bash
node /caminho/agent-harness/dist/adopt.js --tool codex --target "$PWD"
```

O provider usa uma fonte pública fixada por commit. Não são ativados MCPs nem
configurações globais.

## 4. Inicialize o contexto

Abra o agente escolhido na raiz e execute a skill `project-init`. Defina:

- idioma do projeto;
- objetivo e stack;
- comandos de build, lint e teste;
- regras não negociáveis;
- primeira spec.

Revise os arquivos de memória/spec antes de commitá-los. Não registre tokens,
credenciais, dados pessoais ou caminhos locais privados.

## 5. Valide e versione

```bash
git status
git diff
# rode build/lint/test do projeto
git add AGENTS.md .claude .agents
git commit -m "chore: adopt agent harness"
```

Em Claude/Gemini, os caminhos instalados diferem; consulte [Providers](providers.md).
