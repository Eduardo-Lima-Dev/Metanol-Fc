# Modelo de Especificação de Testes (BDD)

- Status: aprovado
- Data: 2026-07-13

Este documento serve como modelo padrão para a criação de especificações de testes
no projeto **Metanol FC** utilizando a metodologia de Desenvolvimento Guiado por
Comportamento (BDD — Behavior-Driven Development).

Para criar uma nova especificação, copie este arquivo para
`RFxx-nome-curto.md` (ex.: `RF02-gerenciamento-rachas.md`) e substitua o conteúdo
de exemplo abaixo pelo do requisito correspondente.

---

## Estrutura Recomendada para Especificação

Cada especificação de testes deve conter:

1. **Identificação do Caso**: Código do Requisito associado (ex: `RF01`).
2. **Funcionalidade**: Descrição curta do objetivo da funcionalidade.
3. **Contexto (Narrativa)**: O papel, o desejo e o benefício:
   - **Como** [papel/ator]
   - **Eu quero** [desejo/funcionalidade]
   - **Para que** [benefício/valor de negócio]
4. **Cenários de Teste**: Cenários positivos (caminho feliz/bons) e negativos
   (caminhos de exceção/ruins) descritos na sintaxe Gherkin (`Dado`, `Quando`, `Então`).

---

## Exemplo Prático: Cadastro de Usuário (RF01)

Abaixo está um exemplo de como estruturar a especificação para o cadastro de
novos usuários.

### Funcionalidade: Cadastro de Novos Usuários

**ID do Requisito:** [RF01 — Cadastro e Login](../requisitos/requisitos-funcionais.md#rf01--cadastro-e-login)
**Como** novo visitante do sistema
**Eu quero** me cadastrar informando meus dados pessoais
**Para que** eu possa acessar a plataforma, participar de rachas e gerenciar times

---

### Cenários de Sucesso (Caminho Feliz - "Bons")

#### Cenário 1: Cadastro realizado com sucesso

```gherkin
Cenário: Cadastro realizado com sucesso apenas com dados obrigatórios
  Dado que eu estou na página de cadastro de novos usuários
  Quando eu preencho o campo "Nome" com "Eduardo Lima"
  E preencho o campo "E-mail" com "eduardo.lima@metanolfc.com"
  E preencho o campo "Senha" com "SenhaSegura123!"
  E clico no botão "Cadastrar"
  Então o sistema deve criar a minha conta com sucesso no banco de dados de forma segura (com hash de senha)
  E deve me redirecionar para a tela de login
  E exibir a mensagem de sucesso "Cadastro realizado com sucesso! Faça login para continuar."
```

#### Cenário 2: Cadastro com apelido opcional

```gherkin
Cenário: Cadastro preenchendo o campo opcional de apelido
  Dado que eu estou na página de cadastro de novos usuários
  Quando eu preencho o campo "Nome" com "Eduardo Lima"
  E preencho o campo "Apelido" com "Dudu"
  E preencho o campo "E-mail" com "dudu@metanolfc.com"
  E preencho o campo "Senha" com "SenhaForte987!"
  E clico no botão "Cadastrar"
  Então o sistema deve criar a minha conta com sucesso
  E deve armazenar o apelido "Dudu" associado ao meu perfil de jogador
  E me redirecionar para a tela de login
```

---

### Cenários de Falha (Caminho de Exceção - "Ruins")

#### Cenário 3: Tentativa de cadastro com e-mail já existente

```gherkin
Cenário: Cadastro rejeitado por e-mail duplicado
  Dado que o e-mail "eduardo.lima@metanolfc.com" já está cadastrado no sistema
  E eu estou na página de cadastro de novos usuários
  Quando eu preencho o campo "Nome" com "Eduardo Outro"
  E preencho o campo "E-mail" com "eduardo.lima@metanolfc.com"
  E preencho o campo "Senha" com "SenhaSecreta999!"
  E clico no botão "Cadastrar"
  Então o sistema não deve permitir o cadastro
  E deve exibir uma mensagem de erro clara indicando "O e-mail informado já está em uso."
  E manter os campos preenchidos na tela para correção (exceto o campo de senha)
```

#### Cenário 4: Tentativa de cadastro com senha fraca

```gherkin
Cenário: Cadastro rejeitado por senha fora dos padrões mínimos de segurança
  Dado que eu estou na página de cadastro de novos usuários
  Quando eu preencho o campo "Nome" com "Eduardo Lima"
  E preencho o campo "E-mail" com "eduardo.novo@metanolfc.com"
  E preencho o campo "Senha" com "123"
  E clico no botão "Cadastrar"
  Então o sistema não deve permitir o cadastro
  E deve exibir um alerta de validação informando que a senha é muito curta ou fraca
```

#### Cenário 5: Tentativa de cadastro sem preencher campos obrigatórios

```gherkin
Cenário: Cadastro rejeitado por ausência de campos obrigatórios
  Dado que eu estou na página de cadastro de novos usuários
  Quando eu deixo os campos "Nome", "E-mail" e "Senha" em branco
  E clico no botão "Cadastrar"
  Então o sistema não deve permitir o envio do formulário
  E deve destacar os campos obrigatórios que não foram preenchidos
```
