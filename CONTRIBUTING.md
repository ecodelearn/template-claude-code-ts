# Contributing / Como contribuir

[English](#english) · [Português do Brasil](#português-do-brasil)

## English

Thank you for helping make Agent Harness safer and more universal.

### Before opening work

1. Search existing issues and pull requests.
2. Discuss large provider, package, or architecture changes in an issue.
3. Never include credentials, private memory, customer data, or local MCP config.

### Development

```bash
git clone https://github.com/ecodelearn/template-claude-code-ts.git
cd template-claude-code-ts
npm ci
npm test
```

Create a focused branch, add tests before production changes, and keep providers
backward-compatible. Run:

```bash
npm test
npm pack --dry-run
git diff --check
```

Every public guide added under `docs/en/` must have an equivalent
`docs/pt-BR/` guide, and vice versa. Do not claim npm availability while the
package remains `private: true`.

Pull requests should explain what changed, why, user impact, security impact, and
verification. Maintainers may request changes before merging.

## Português do Brasil

Obrigado por ajudar a tornar o Agent Harness mais seguro e universal.

### Antes de iniciar

1. Pesquise issues e pull requests existentes.
2. Discuta mudanças grandes de provider, pacote ou arquitetura em uma issue.
3. Nunca inclua credenciais, memória privada, dados de clientes ou configuração MCP local.

### Desenvolvimento

```bash
git clone https://github.com/ecodelearn/template-claude-code-ts.git
cd template-claude-code-ts
npm ci
npm test
```

Crie uma branch focada, escreva testes antes do código de produção e preserve
compatibilidade dos providers. Rode:

```bash
npm test
npm pack --dry-run
git diff --check
```

Todo guia público em `docs/pt-BR/` deve possuir equivalente em `docs/en/`, e
vice-versa. Não anuncie disponibilidade npm enquanto `private: true` permanecer.

O PR deve explicar mudança, motivo, impacto ao usuário, impacto de segurança e
verificações. Maintainers podem solicitar ajustes antes do merge.
