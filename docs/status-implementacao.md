# Status de Implementação — Metanol FC

- Status: em andamento (atualizar a cada entrega)
- Data: 2026-08-24

Acompanhamento do que já foi implementado no código em relação aos requisitos
funcionais ([`requisitos/requisitos-funcionais.md`](./requisitos/requisitos-funcionais.md))
e não funcionais ([`requisitos/requisitos-nao-funcionais.md`](./requisitos/requisitos-nao-funcionais.md)).
Serve como visão rápida de progresso — não substitui os documentos de requisitos, que
continuam sendo a fonte de verdade sobre *o que* deve ser construído.

## Legenda

- ✅ Implementado
- 🟡 Parcial (existe algo no código, mas incompleto ou sem persistência real)
- ❌ Não implementado

## RF01 — Cadastro e Login

| Item | Status | Onde |
|------|--------|------|
| RF01.1 Cadastro (nome, apelido, e-mail, senha) | ✅ | [`apps/api/src/auth`](../apps/api/src/auth) |
| RF01.2 Validação de e-mail e senha mínima | ✅ | `registerUserSchema`/`loginSchema` em [`packages/shared`](../packages/shared/src/schemas/user.schema.ts) |
| RF01.3 Hash de senha | ✅ | `bcrypt` em `auth.service.ts` |
| RF01.4 Login com erro claro | ✅ | `auth.service.ts` |
| RF01.5 Edição de perfil *(sugestão)* | ❌ | Schema `updateUserProfileSchema` existe, sem endpoint |

## RF02 — Gerenciamento de Rachas

| Item | Status | Onde |
|------|--------|------|
| RF02.1 Criar racha (nome, dia/horário opcional) | ✅ | [`apps/api/src/racha`](../apps/api/src/racha) |
| RF02.2 Criador vira admin automaticamente | ✅ | `RachaService.create` (transação: `Racha` + `RachaMember(admin)` + `Player`) |
| RF02.3 Admin adiciona/remove participantes | ✅ | `RachaController` (`POST`/`DELETE /rachas/:rachaId/members`) |
| RF02.4 Múltiplos rachas por usuário, múltiplos admins (promoção unilateral) | ✅ | `PATCH /rachas/:rachaId/members/:userId/role`; bloqueia remover/rebaixar o último admin |
| RF02.5 Listar rachas do usuário com o papel exercido | ✅ | `GET /rachas` (`RachaWithRole` em `packages/shared`) |

## RF03 — Jogadores

| Item | Status | Onde |
|------|--------|------|
| RF03.1–RF03.2 (jogador por racha, média/gols/assistências) | ✅ | [`apps/api/src/players`](../apps/api/src/players) — `GET /rachas/:rachaId/players` |
| RF03.3 Atualização por admin | ✅ | `PATCH /rachas/:rachaId/players/:playerId/stats` |
| RF03.4.1 Upload `.txt` de médias | ✅ | `POST /rachas/:rachaId/players/import-averages`; parser em `player-averages-parser.ts` |
| RF03.4.2 Avaliação pública (mediana + abstenção) | ✅ | [`apps/api/src/evaluations`](../apps/api/src/evaluations); `score: null` registra abstenção, ignorada em `PlayersService.computeEffectiveAverages` |
| RF03.5 Jogador avulso *(extensão)* | ✅ | `POST /rachas/:rachaId/players/guests`; `Player.userId` opcional + `guestName` |

## RF04 — Histórico de Times

| Item | Status | Onde |
|------|--------|------|
| RF04.1 Persistir registro a cada divisão gerada | ✅ | `TeamSplitService.generate` chama `TeamSplitHistoryService.create` ao final de cada geração |
| RF04.2 Consultar histórico de um racha, ordenado por data | ✅ | `GET /rachas/:rachaId/team-splits` (paginado) |
| RF04.3 Visualizar parâmetros usados em cada divisão | ✅ | `GET /rachas/:rachaId/team-splits/:teamSplitId` |

## RF05 — Divisão de Times via Algoritmo Genético

| Item | Status | Onde |
|------|--------|------|
| RF05.1 Iniciar divisão informando jogadores presentes | ✅ | `POST /rachas/:rachaId/team-splits/generate`, restrito ao admin do racha (`RachaAdminGuard`) |
| RF05.2 Representação do cromossomo | ✅ | [`engine/chromosome.ts`](../apps/api/src/team-split/engine/chromosome.ts) |
| RF05.3 População inicial respeitando tamanho dos times | ✅ | `engine/chromosome.ts` + `engine/team-sizes.ts` |
| RF05.4 Função de fitness com pesos configuráveis | ✅ | [`engine/fitness.ts`](../apps/api/src/team-split/engine/fitness.ts) |
| RF05.5 Seleção, crossover + correção, mutação por translocação | ✅ | [`engine/operators.ts`](../apps/api/src/team-split/engine/operators.ts) — coberto por `operators.spec.ts` |
| RF05.6 Parâmetros configuráveis com defaults | ✅ | `defaultGeneticAlgorithmParams` em `packages/shared` |
| RF05.7 Retorno + persistência no histórico | ✅ | `TeamSplitService.generate` monta os times e persiste via `TeamSplitHistoryService` |

Detalhamento do algoritmo em
[`arquitetura/divisao-times-algoritmo-genetico.md`](./arquitetura/divisao-times-algoritmo-genetico.md).

## RF06 — Parâmetros de Divisão

| Item | Status | Onde |
|------|--------|------|
| RF06.1–RF06.2 Nº de times e jogadores por time | ✅ | `teamSplitParamsSchema` em `packages/shared` |
| RF06.3 Distribuição round-robin de excedentes | ✅ | [`engine/team-sizes.ts`](../apps/api/src/team-split/engine/team-sizes.ts) — coberto por `team-sizes.spec.ts` |
| RF06.4 Pesos ajustáveis *(sugestão)* | ✅ | Coberto junto do RF05.4 |

## Requisitos não funcionais

| Área | Status | Observação |
|------|--------|------------|
| RNF01 Performance | 🟡 | AG roda rápido em memória, mas sem medição real registrada; loading states não se aplicam ainda (não há telas) |
| RNF02 Segurança | 🟡 | Hash ✅, JWT via cookie httpOnly ✅ (payload inclui `sub`/id desde o RF02), rate limit no login ✅ (`ThrottlerModule`, em memória — ver nota da RNF03.1), validação Zod no servidor ✅, autorização por papel de admin de racha ✅ (`RachaRoleGuard`, RNF02.6); refresh token ❌ |
| RNF03 Disponibilidade/Infra | ❌ | Sem deploy, sem adapter serverless, sem ADR de hospedagem |
| RNF04 Escalabilidade | 🟡 | AG já roda isolado por requisição, sem estado compartilhado (RNF04.2) |
| RNF05 Usabilidade/Acessibilidade | ❌ | Sem UI real (web/app ainda são o template padrão de scaffolding) |
| RNF06 Compatibilidade | ➖ | Não avaliável sem UI |
| RNF07 Manutenibilidade | 🟡 | Contratos centralizados em `packages/shared` ✅; testes automatizados existem só para o motor do AG (RF05/RF06) |
| RNF08 Observabilidade | ❌ | Sentry não configurado em nenhuma app; sem logs estruturados |
| RNF09 Privacidade | 🟡 | Minimização de dados ok (RF01.1); LGPD adiada por decisão própria; avaliação pública identifica o avaliador no banco (sem anonimato) |
| RNF10 Backup | ➖ | Adiado por decisão própria, depende do provedor de banco |

## Visão macro por camada

| Camada | Estado |
|--------|--------|
| `apps/api` | Módulos `auth`, `team-split` (+ histórico), `racha`, `players` e `evaluations` implementados; `prisma/schema.prisma` tem `Users`, `Racha`, `RachaMember`, `Player`, `Evaluation`, `TeamSplit` |
| `apps/web` | Boilerplate padrão do Vite — nenhuma tela do produto construída |
| `apps/app` | Boilerplate padrão do Expo — nenhuma tela do produto construída |
| `packages/shared` | Contratos Zod cobrindo praticamente todo o domínio (RF01–RF06); `racha`/`racha-member`/`player`/`evaluation`/`team-split` já consumidos pela API |

## Lacunas críticas (ordem sugerida de ataque)

1. **Edição de perfil (RF01.5)** — schema `updateUserProfileSchema` já existe em
   `packages/shared`, falta só o endpoint (`GET`/`PATCH /users/me`).
2. **Telas de produto em `apps/web`/`apps/app`**, hoje inteiramente ausentes.
3. **Observabilidade (Sentry) e infraestrutura de deploy**, antes de expor o sistema
   fora do ambiente local.

## Como manter este documento atualizado

Atualizar a tabela correspondente sempre que um requisito mudar de status, na mesma PR
que faz a implementação (`docs(status): atualiza RF0x para implementado`, seguindo
[`processo/git-workflow.md`](./processo/git-workflow.md)). Não é necessário detalhar o
"porquê" de decisões técnicas aqui — isso pertence a um ADR em
[`decisoes/`](./decisoes), com link a partir da linha correspondente na tabela se fizer
sentido.
