# Adopt CLI universal (TypeScript)

Nome de distribuição escolhido: `@ecodelearn/agent-harness`. A publicação ainda
permanece bloqueada; quando liberada, o executável será `agent-harness`.

A adocao de templates para ferramentas de code-cli agora usa um core em TypeScript com providers.

## Como usar

### Opção 1 (recomendada): via npm script

```bash
npm install
npm run adopt -- --tool claude --target /caminho/para/projeto
npm run adopt -- --tool codex --target /caminho/para/projeto
npm run adopt -- --tool gemini --target /caminho/para/projeto
npm run adopt -- --tool claude --target /caminho/para/projeto --dry-run
```

### Opção 2: execução direta do build

```bash
npm install
npm run build
node dist/adopt.js --tool claude --target /caminho/para/projeto
node dist/adopt.js --tool gemini --target /caminho/para/projeto
```

### Opção 3 (Windows PowerShell)

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\adopt.ps1 -Tool claude -Target C:\caminho\para\projeto
.\adopt.ps1 -Tool gemini -Target C:\caminho\para\projeto
```

### Opção 4: instalação global local (sem repetir build)

```bash
npm install
npm run build
npm link

# Em qualquer projeto git:
agent-harness --tool claude --target .
agent-harness --tool gemini --target .
```

Argumentos:

- `--tool`: provider da ferramenta (ex.: `claude`, `gemini`)
- `--source`: repositorio git ou caminho local do template (opcional)
- `--ref`: tag ou commit obrigatório para fontes remotas personalizadas
- `--target`: diretorio de destino (padrao: diretorio atual)
- `--yes`: aceita sobrescritas sem prompt
- `--dry-run`: mostra cópias, sobrescritas e preservações sem alterar o destino
- `--rollback <id>`: restaura os arquivos substituídos por uma transação
- `--list-transactions`: lista backups vinculados ao projeto
- `--forget <id>`: exclui definitivamente um backup; pede confirmação

Cada execução real cria uma transação em
`.git/adopt-cli/transactions/<id>`. O backup fica no diretório interno do Git,
fora do working tree. Ao final, o CLI mostra o ID e o comando exato de rollback.
Depois de validar o projeto, use `--list-transactions` para revisar os backups e
`--forget <id>` para remover apenas uma transação específica. Não existe limpeza
recursiva ou por curinga.

Os providers usam commits fixados por padrão. Ao informar outro repositório remoto
com `--source`, também informe `--ref`; o CLI não aceita uma branch remota implícita.
Fontes locais são usadas como estão e não aceitam `--ref`.

Mesmo em fontes locais, a camada de cópia exclui `.env*`, chaves privadas,
`README_MCP.md`, arquivos `*.local.*`, diretórios `.git` e
`agent-memory-local`. Essas exclusões são globais e não podem ser desativadas por
um provider.

> Execute primeiro com `--dry-run`. Embora backup/rollback e fontes fixadas já
> existam, o pacote ainda precisa de revisão de empacotamento e testes
> multiplataforma antes de publicação ou uso via `npx`.

### Notas para `--tool gemini`

- Copia `GEMINI.md` e `AGENTS.md` (sem sobrescrever se ja existirem).
- Copia skills para `.gemini/skills` (escopo do workspace no Gemini CLI).
- Nao copia `.claude/` (modo minimalista para Gemini CLI).
- `--tool antigravity` segue aceito como alias legado de compatibilidade.

### Notas para `--tool codex`

- Instala `AGENTS.md` sem sobrescrever uma orientação já existente.
- Mantém memória, specs e referências em `.claude/` por compatibilidade com o
  protocolo canônico atual.
- Espelha as skills em `.agents/skills`, diretório de descoberta oficial do Codex.
- Não cria `.codex/config.toml`, não altera configuração global e não ativa MCPs.

Parâmetros no PowerShell:

- `-Tool`: provider da ferramenta
- `-Source`: repositório git ou caminho local do template
- `-Target`: diretório de destino
- `-Yes`: aceita sobrescritas sem prompt

## Arquitetura

- `src/adopt.ts`: engine de copia, prompts e resolucao de source
- `src/types.ts`: contrato `ToolProvider`
- `src/providers/*.ts`: regras especificas por ferramenta

## Verificação multiplataforma

O workflow `.github/workflows/ci.yml` executa build, testes, ciclo transacional do
provider Codex e auditoria `npm pack --dry-run` em:

- Ubuntu com Node.js 20 e 22
- macOS com Node.js 20
- Windows com Node.js 20

Os testes de integração são escritos em Node.js e não dependem de Bash ou
PowerShell. As Actions externas são fixadas por SHA e o workflow recebe somente
permissão de leitura do conteúdo.

## Como adicionar outra tool

1. Crie um novo provider em `src/providers/<tool>.ts` implementando `ToolProvider`.
2. Registre no mapa em `src/providers/index.ts`.
3. Defina `copyRules`, `nextSteps` e `afterCopy` conforme a ferramenta.

Com isso, o core continua o mesmo e voce troca apenas o comportamento por provider.
