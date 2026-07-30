# Referências Oficiais

> Consulte ANTES de fazer web search ou implementar algo.
> Prefira sempre fontes oficiais para boas práticas, padrões de código e APIs.
> A seção "Deste Projeto" é preenchida pelo project-init ou manualmente conforme o projeto evolui.

## Sem fonte confiável

Afirmações de alto risco — número de versão de lib/pacote, flag de CLI, assinatura de API, chave de config, nome de env var, data exata, paper/autor citado — precisam ser rastreáveis até uma fonte listada aqui, a doc oficial ou o próprio código.

Se não houver: diga isso explicitamente em vez de chutar. Não afirme uma versão, flag ou formato de API não verificado com a mesma confiança de algo verificado — marque como não confirmado e aponte onde o usuário pode checar.

---

## Claude Code

| Recurso | URL | Quando usar |
|---------|-----|-------------|
| Repositório oficial | https://github.com/anthropics/claude-code | Issues, changelog, código-fonte |
| Cookbooks Claude Code | https://github.com/anthropics/claude-cookbooks | Exemplos prontos de uso do Claude Code |
| Skills oficiais | https://github.com/anthropics/skills | Skills de referência mantidas pela Anthropic |

## Claude / Anthropic API

| Recurso | URL | Quando usar |
|---------|-----|-------------|
| Documentação principal | https://platform.claude.com/docs/en/home | API, modelos, parâmetros, limites |
| Anthropic Cookbook | https://github.com/anthropics/anthropic-cookbook | Padrões de uso da API, exemplos práticos |
| SDK Python | https://github.com/anthropics/anthropic-sdk-python | Referência do SDK oficial Python |
| SDK Node.js | https://github.com/anthropics/anthropic-sdk-javascript | Referência do SDK oficial Node.js |
| Model Context Protocol | https://modelcontextprotocol.io/docs | Documentação oficial de servidores MCP |

## Como usar estas referências

**Antes de web search:**
Verifique se a dúvida está coberta por uma das fontes acima. Prefira a documentação oficial a resultados genéricos.

**Ao implementar features com Claude API:**
Consulte o Anthropic Cookbook para padrões já validados antes de criar do zero.

**Ao criar ou configurar skills/hooks/agents:**
Consulte o repositório `claude-code` e `claude-cookbooks` para exemplos de referência.

**Ao integrar um servidor MCP:**
Consulte `modelcontextprotocol.io/docs` para a especificação e `claude-code` para exemplos de configuração.

---

## Deste Projeto

> Preenchido pelo `project-init` ou manualmente conforme o projeto cresce.
> Adicione a documentação oficial de cada lib, framework e ferramenta usada.

<!--
FORMATO:
| [Nome da lib/framework] | [URL da doc oficial] | [Quando consultar] |
-->

| Recurso | URL | Quando usar |
|---------|-----|-------------|
| — | — | — |
