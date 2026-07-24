# Spec: Documentação bilíngue para adoção pública

**Status:** `completed`
**Slug:** `template-claude-code-ts::docs-bilingual-public-adoption`
**Criado em:** 2026-07-24
**Última atualização:** 2026-07-24

## Objetivo

Oferecer documentação equivalente em português do Brasil e inglês para instalação,
uso, adoção em projetos novos ou existentes, segurança, arquitetura e contribuição
do futuro pacote `@ecodelearn/agent-harness`.

## Princípios

- Não afirmar que o pacote npm está publicado enquanto `private: true`.
- Todo guia público canônico deve existir em PT-BR e inglês.
- Comandos devem funcionar em macOS, Linux e Windows ou declarar a diferença.
- Adoção deve começar por `--dry-run` e explicar transação/rollback.
- Configuração global, MCPs e segredos nunca são instalados automaticamente.
- Contribuição externa deve ter contrato claro, templates e checks reproduzíveis.

## Entregáveis

- [x] Landing page PT-BR (`README.md`) e inglesa (`README.en.md`).
- [x] Getting started bilíngue.
- [x] Projetos novos e adoção de projetos existentes.
- [x] Referência completa do CLI.
- [x] Providers e matriz de arquivos.
- [x] Arquitetura e modelo de segurança.
- [x] `CONTRIBUTING.md`, `SECURITY.md`, código de conduta, template de PR e issues.
- [x] Teste automático de presença, paridade estrutural e links relativos.
- [x] CI atualizada para Actions com runtime Node 24.
- [x] Validar CI multiplataforma e review no PR.

## Fora do escopo

- Publicar no npm.
- Tornar o repositório público.
- Ativar MCPs.
- Garantir suporte a providers ainda não implementados.

## Verificação

- `npm test`
- `npm pack --dry-run`
- CI Ubuntu/macOS/Windows
- revisão manual dos pares PT-BR/EN

## Estado de implementação

Em 2026-07-24 foram criados seis pares de guias, landing pages bilíngues e arquivos
de comunidade. O pacote auditado contém apenas runtime e documentação pública
bilíngue (27 entradas), sem specs/memória internas. A visibilidade do repositório
não foi alterada. O PR draft #3 passou em Ubuntu (Node 20 e 22), macOS, Windows e
GitGuardian; não havia comentários ou threads de review pendentes na validação.
