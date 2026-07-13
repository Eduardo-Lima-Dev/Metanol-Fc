# Especificação de Testes — Metanol FC

Índice das especificações de testes do projeto, escritas em BDD (Behavior-Driven
Development). Cada arquivo desta pasta detalha os cenários de teste (bons e ruins)
de **um requisito funcional específico**.

## Convenções

- Um arquivo por requisito funcional, nomeado `RFxx-nome-curto.md` (ex.:
  `RF01-cadastro-login.md`), espelhando a numeração usada em
  [`../requisitos/requisitos-funcionais.md`](../requisitos/requisitos-funcionais.md).
- Antes de criar uma especificação nova, use [`_modelo.md`](./_modelo.md) como
  ponto de partida — ele documenta a estrutura padrão e traz um exemplo completo.
- Cada especificação deve conter, no mínimo:
  1. Identificação do requisito (código RF associado, com link para o requisito).
  2. Contexto/narrativa (Como / Eu quero / Para que).
  3. Cenários de sucesso (caminho feliz).
  4. Cenários de falha (caminhos de exceção), incluindo validações e regras de negócio.
- Cenários são escritos em Gherkin (`Dado`, `Quando`, `Então`, `E`).
- Cada documento novo deve ter título, data de criação e status (rascunho, em
  revisão, aprovado), como as demais pastas em [`docs/`](../).

## Especificações

_(nenhuma especificação criada ainda — use `_modelo.md` para começar a primeira)_
