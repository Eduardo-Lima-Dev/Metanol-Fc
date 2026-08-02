# Documentação — Metanol FC

Índice da documentação do projeto. Mantenha esta pasta atualizada conforme o produto evolui.

## Estrutura

- [`requisitos/`](./requisitos) — requisitos funcionais e não funcionais, histórias de usuário, escopo.
- [`arquitetura/`](./arquitetura) — visão geral técnica, diagramas, decisões de infraestrutura.
- [`decisoes/`](./decisoes) — Architecture Decision Records (ADRs), uma decisão relevante por arquivo.
- [`especificacao-testes/`](./especificacao-testes) — especificação de testes em BDD, um requisito funcional por arquivo.
- [`api/`](./api) — contratos e documentação da API (endpoints, autenticação, versionamento).
- [`processo/`](./processo) — fluxo de trabalho do time: branches, Pull Requests, padrão de commits.

## Convenções

- Cada documento novo deve ter um título, data de criação e status (rascunho, em revisão, aprovado).
- ADRs seguem numeração sequencial: `0001-titulo-curto.md`, `0002-titulo-curto.md`, etc.
- Especificações de teste seguem o código do requisito: `RF01-nome-curto.md`,
  `RF02-nome-curto.md`, etc. (ver [`especificacao-testes/_modelo.md`](./especificacao-testes/_modelo.md)).
- Requisitos referenciam o código quando aplicável usando caminhos relativos ao repositório.
