# Instalação e primeiro uso

[Português](getting-started.md) · [English](../en/getting-started.md)

## Requisitos

- Git
- Node.js 20 ou superior
- npm
- Um projeto já inicializado como repositório Git

O pacote npm continua com `private: true`. Por enquanto, execute pelo checkout:

```bash
git clone https://github.com/ecodelearn/template-claude-code-ts.git
cd template-claude-code-ts
npm ci
npm run build
```

## Primeira prévia

```bash
node dist/adopt.js \
  --tool codex \
  --target /caminho/para/projeto \
  --dry-run
```

Troque `codex` por `claude` ou `gemini` conforme o agente. Leia o plano:

- `COPIAR`: destino ainda não existe;
- `PRESERVAR`: o arquivo existente será mantido;
- `PERGUNTAR`: a execução real solicitará confirmação;
- `SOBRESCREVER`: haverá backup antes da substituição;
- `AUSENTE`: a fonte não contém o item.

## Aplicação

```bash
node dist/adopt.js --tool codex --target /caminho/para/projeto
```

Ao terminar, o CLI imprime um ID de transação e o comando de rollback. Guarde esse
ID até validar o projeto.

## Validação

No projeto adotado:

1. revise `git status` e `git diff`;
2. abra o agente na raiz do repositório;
3. confirme que `AGENTS.md` foi carregado;
4. execute `project-init` em projeto novo ou `project-adopt` em projeto existente;
5. rode os testes do próprio projeto;
6. só depois remova o backup da transação.

```bash
node /caminho/do/harness/dist/adopt.js --target . --list-transactions
node /caminho/do/harness/dist/adopt.js --target . --forget <id>
```

## Uso futuro via npm

O comando planejado é:

```bash
npx @ecodelearn/agent-harness --tool codex --target . --dry-run
```

Ele ainda não funciona no registro público enquanto `private: true` estiver ativo.
