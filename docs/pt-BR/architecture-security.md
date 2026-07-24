# Arquitetura e segurança

[Português](architecture-security.md) · [English](../en/architecture-security.md)

## Componentes

1. `template-claude-code-open`: fonte pública canônica do conteúdo comum.
2. `@ecodelearn/agent-harness`: CLI, resolução de fonte e transações.
3. Providers: regras específicas para Claude, Codex e Gemini.
4. Repositório-alvo: único escopo de escrita autorizado.

## Fluxo

```text
argumentos → provider → fonte fixada → plano → confirmação
          → pré-validação total → backup → cópia → pós-processamento
          → manifesto concluído
```

`--dry-run` termina após o plano. Na execução real, todos os destinos são
validados antes da criação do estado transacional.

## Modelo de ameaça

O instalador reduz riscos de:

- sobrescrita acidental;
- travessia de diretório;
- fonte remota mutável;
- cópia de segredos locais;
- rollback aplicado em outro projeto;
- pacote npm contendo memória/specs internas.

Não protege contra uma fonte local deliberadamente maliciosa, comprometimento do
Git/Node/npm, permissões administrativas indevidas ou instruções maliciosas dentro
de arquivos permitidos. Revise a fonte e o diff.

## Backups

Backups ficam no Git dir real, inclusive em worktrees:

```text
.git/adopt-cli/transactions/<id>/
├── manifest.json
└── backup/
```

O diretório pai recebe modo restritivo quando suportado. Backups podem conter
configurações antigas; remova-os individualmente depois da validação.

## Dados que nunca devem ser copiados

- `.env`, `.envrc` e qualquer basename iniciado por `.env`;
- `*.pem`, `*.key`, `*.p12`, `*.pfx`;
- `README_MCP.md`;
- `.git`;
- `agent-memory-local`;
- arquivos com `.local.` ou terminados em `.local`.

Relate vulnerabilidades pelo processo privado descrito em
[SECURITY.md](../../SECURITY.md), nunca em issue pública com segredo ou exploit.
