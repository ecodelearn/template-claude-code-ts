# Referência do CLI

[Português](cli-reference.md) · [English](../en/cli-reference.md)

## Adoção

```text
agent-harness --tool <provider> [--source <repo-ou-caminho>]
  [--ref <tag-ou-commit>] [--target <diretório>] [--yes] [--dry-run]
```

| Opção | Função |
|---|---|
| `--tool` | `claude`, `codex`, `gemini` ou alias legado `antigravity` |
| `--source` | `owner/repo`, URL Git ou caminho local |
| `--ref` | tag/commit obrigatório para fonte remota personalizada |
| `--target` | raiz do repositório Git; padrão: diretório atual |
| `--dry-run` | mostra o plano sem copiar, remover ou pós-processar |
| `--yes` | aceita prompts de sobrescrita; use apenas após a prévia |

Fontes padrão dos providers já são fixadas por SHA. Fontes locais são usadas como
estão e não aceitam `--ref`.

## Transações

```bash
agent-harness --target . --list-transactions
agent-harness --target . --rollback <id>
agent-harness --target . --forget <id>
agent-harness --target . --forget <id> --yes
```

- `--rollback` restaura uma transação aplicada;
- `--list-transactions` lista somente transações vinculadas ao projeto;
- `--forget` exclui definitivamente um backup específico e pede confirmação.

Os backups ficam em `.git/adopt-cli/transactions/<id>` e não entram no working
tree. Não existe limpeza por curinga.

## Códigos de saída

- `0`: comando concluído ou cancelamento seguro de prompt;
- `1`: argumento inválido, fonte indisponível, projeto inválido ou falha operacional.

## Exemplos

```bash
agent-harness --tool codex --target . --dry-run
agent-harness --tool claude --target . --yes
agent-harness --tool gemini --source owner/template --ref v1.2.0 --target .
```
