# Instalação e primeiro uso

[Português](getting-started.md) · [English](../en/getting-started.md)

## Requisitos

- Git
- Node.js 20 ou superior
- npm
- Um projeto já inicializado como repositório Git

`@ecodelearn/agent-harness` está publicado no npm — sem precisar de checkout:

```bash
npx @ecodelearn/agent-harness --tool codex --target /caminho/para/projeto --dry-run
```

Troque `codex` por `claude` ou `gemini` conforme o agente.

### Alternativa: a partir de um checkout do repositório

```bash
git clone https://github.com/ecodelearn/template-claude-code-ts.git
cd template-claude-code-ts
npm ci
npm run build
node dist/adopt.js --tool codex --target /caminho/para/projeto --dry-run
```

## Primeira prévia

```bash
npx @ecodelearn/agent-harness --tool codex --target /caminho/para/projeto --dry-run
```

Leia o plano:

- `COPIAR`: destino ainda não existe;
- `PRESERVAR`: o arquivo existente será mantido;
- `PERGUNTAR`: a execução real solicitará confirmação;
- `SOBRESCREVER`: haverá backup antes da substituição;
- `AUSENTE`: a fonte não contém o item.

## Aplicação

```bash
npx @ecodelearn/agent-harness --tool codex --target /caminho/para/projeto
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
npx @ecodelearn/agent-harness --target . --list-transactions
npx @ecodelearn/agent-harness --target . --forget <id>
```
