# Fluxo de Git — Branches e Commits

- Status: aprovado
- Data: 2026-07-03

Este documento define o padrão de branches e de mensagens de commit usado no projeto
Metanol FC. Vale para `apps/api`, `apps/web`, `apps/app`, `packages/shared` e `docs/`.

## Branches principais

| Branch    | Ambiente         | Origem            | Quem faz merge nela |
|-----------|------------------|--------------------|----------------------|
| `main`    | Produção (prod)  | `homolog`          | PR de `homolog`, após validação em homologação |
| `homolog` | Homologação      | `develop`          | PR de `develop`, após as features previstas estarem prontas |
| `develop` | Integração       | branches de feature | PRs das branches de trabalho de cada desenvolvedor |

- `main` e `homolog` são branches protegidas: ninguém commita direto nelas, só via PR.
- `develop` é a base de todo desenvolvimento do dia a dia.
- Deploys automáticos (se configurados em CI/CD) devem seguir essa hierarquia: push em
  `main` → deploy de produção; push em `homolog` → deploy no ambiente de homologação.

## Branches de trabalho

Todo desenvolvimento novo parte de `develop` atualizada:

```bash
git checkout develop
git pull origin develop
git checkout -b <tipo>/<descricao-curta>
```

### Convenção de nome

```
<tipo>/<descricao-curta-em-kebab-case>
```

Tipos de branch (alinhados aos tipos de commit abaixo):

- `feat/` — nova funcionalidade (ex.: `feat/cadastro-de-usuario`)
- `fix/` — correção de bug (ex.: `fix/validacao-email-cadastro`)
- `chore/` — tarefas de manutenção, configuração, dependências
- `docs/` — apenas documentação
- `refactor/` — refatoração sem mudança de comportamento

Se houver referência a uma issue/ticket, incluir o número: `feat/RF03-avaliacao-publica`.

## Pull Requests

1. Push da branch de trabalho e abertura do PR **sempre com destino `develop`**
   (nunca direto para `homolog` ou `main`).
2. O PR deve solicitar revisão de:
   - **Pelo menos um integrante do time**;
   - **GitHub Copilot** (adicionar `@copilot` — ou o app "Copilot" — como reviewer do PR).
3. O título do PR segue o mesmo padrão do Conventional Commits (ver abaixo), já que em
   merges do tipo squash o título do PR vira a mensagem do commit final em `develop`.
4. O PR só é mergeado depois de:
   - Aprovação do integrante do time;
   - Revisão do Copilot concluída (comentários relevantes tratados);
   - Checks de CI passando (`pnpm lint`, `pnpm typecheck`, `pnpm build`, testes).
5. Preferir **squash merge** para manter o histórico de `develop` limpo (um commit por PR).

### Promoção entre ambientes

- `develop` → `homolog`: PR abrindo o conjunto de features prontas para validação.
- `homolog` → `main`: PR após validação em homologação, marcando release de produção.
  Considerar criar uma tag de versão (ex.: `v1.2.0`) no merge para `main`.

## Conventional Commits

Todo commit segue o formato:

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos

| Tipo       | Uso |
|------------|-----|
| `feat`     | Nova funcionalidade |
| `fix`      | Correção de bug |
| `docs`     | Alteração apenas de documentação |
| `style`    | Formatação, espaços, ponto e vírgula — sem mudança de lógica |
| `refactor` | Refatoração de código sem mudar comportamento externo |
| `perf`     | Melhoria de performance |
| `test`     | Adição ou ajuste de testes |
| `build`    | Mudanças no sistema de build ou dependências (ex.: `pnpm`, `turbo`) |
| `ci`       | Configuração de CI/CD |
| `chore`    | Tarefas diversas que não alteram código de produção |
| `revert`   | Reversão de um commit anterior |

### Escopo

Use o nome do pacote/app afetado como escopo, quando fizer sentido:

```
feat(api): adiciona endpoint de criação de racha
fix(web): corrige validação do formulário de login
feat(app): tela de avaliação pública de jogadores
feat(shared): adiciona schema de Evaluation
docs: adiciona fluxo de branches e commits
```

### Breaking changes

Mudanças que quebram compatibilidade (ex.: alteração de um schema em `packages/shared`
consumido pelas três apps) devem ser marcadas com `!` após o tipo/escopo e explicadas no
rodapé:

```
feat(shared)!: renomeia campo `nickname` para `apelido` no schema de User

BREAKING CHANGE: consumidores de `@metanol/shared` precisam atualizar
referências a `nickname` para `apelido`.
```

### Idioma

Descrição do commit em português, como o restante do projeto. O `<tipo>` continua em
inglês (padrão do Conventional Commits, usado por ferramentas de changelog/CI).

### Exemplos completos

```
feat(api): implementa RF01 — cadastro e login de usuário

fix(app): corrige crash ao abrir avaliação pública sem jogadores presentes

docs(requisitos): resolve pendências de RF03.4 sobre agregação de médias

chore: atualiza dependências do workspace
```
