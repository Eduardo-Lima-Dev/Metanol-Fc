# Status de Implementação — Metanol FC

- Status: em andamento (atualizar a cada entrega)
- Data: 2026-08-03

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
| RF02.1–RF02.5 (criar racha, admin, participantes, múltiplos rachas, listagem) | ❌ | Schemas prontos em `packages/shared` (`racha.schema.ts`, `racha-member.schema.ts`); sem model no Prisma e sem módulo na API |

## RF03 — Jogadores

| Item | Status | Onde |
|------|--------|------|
| RF03.1–RF03.2 (jogador por racha, média/gols/assistências) | ❌ | Schema `player.schema.ts` pronto; sem tabela/endpoint |
| RF03.3 Atualização por admin | ❌ | — |
| RF03.4.1 Upload `.txt` de médias | ❌ | Schema `importPlayerAveragesSchema` pronto; sem parser/endpoint |
| RF03.4.2 Avaliação pública (mediana) | ❌ | Schema `evaluation.schema.ts` pronto; cálculo de mediana não existe no código |

## RF04 — Histórico de Times

| Item | Status | Onde |
|------|--------|------|
| RF04.1–RF04.3 (persistência e consulta do histórico) | ❌ | Schema `teamSplitSchema` pronto; endpoint atual de divisão não grava nada (não há tabela) |

## RF05 — Divisão de Times via Algoritmo Genético

| Item | Status | Onde |
|------|--------|------|
| RF05.1 Iniciar divisão informando jogadores presentes | 🟡 | [`team-split.controller.ts`](../apps/api/src/team-split/team-split.controller.ts) recebe jogadores direto no body, sem vínculo a um racha persistido |
| RF05.2 Representação do cromossomo | ✅ | [`engine/chromosome.ts`](../apps/api/src/team-split/engine/chromosome.ts) |
| RF05.3 População inicial respeitando tamanho dos times | ✅ | `engine/chromosome.ts` + `engine/team-sizes.ts` |
| RF05.4 Função de fitness com pesos configuráveis | ✅ | [`engine/fitness.ts`](../apps/api/src/team-split/engine/fitness.ts) |
| RF05.5 Seleção, crossover + correção, mutação por translocação | ✅ | [`engine/operators.ts`](../apps/api/src/team-split/engine/operators.ts) — coberto por `operators.spec.ts` |
| RF05.6 Parâmetros configuráveis com defaults | ✅ | `defaultGeneticAlgorithmParams` em `packages/shared` |
| RF05.7 Retorno + persistência no histórico | 🟡 | Retorna o melhor cromossomo; não persiste (depende do RF04) |

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
| RNF02 Segurança | 🟡 | Hash ✅, JWT via cookie httpOnly ✅, rate limit no login ✅ (`ThrottlerModule`, em memória — ver nota da RNF03.1), validação Zod no servidor ✅; refresh token ❌; autorização por papel de admin de racha ❌ (o conceito ainda não existe no código) |
| RNF03 Disponibilidade/Infra | ❌ | Sem deploy, sem adapter serverless, sem ADR de hospedagem |
| RNF04 Escalabilidade | 🟡 | AG já roda isolado por requisição, sem estado compartilhado (RNF04.2) |
| RNF05 Usabilidade/Acessibilidade | ❌ | Sem UI real (web/app ainda são o template padrão de scaffolding) |
| RNF06 Compatibilidade | ➖ | Não avaliável sem UI |
| RNF07 Manutenibilidade | 🟡 | Contratos centralizados em `packages/shared` ✅; testes automatizados existem só para o motor do AG (RF05/RF06) |
| RNF08 Observabilidade | ❌ | Sentry não configurado em nenhuma app; sem logs estruturados |
| RNF09 Privacidade | 🟡 | Minimização de dados ok (RF01.1); LGPD adiada por decisão própria; anonimato de avaliação não se aplica ainda (avaliação não existe) |
| RNF10 Backup | ➖ | Adiado por decisão própria, depende do provedor de banco |

## Visão macro por camada

| Camada | Estado |
|--------|--------|
| `apps/api` | Módulos `auth` e `team-split` implementados e testados; `prisma/schema.prisma` só tem o model `Users` |
| `apps/web` | Boilerplate padrão do Vite — nenhuma tela do produto construída |
| `apps/app` | Boilerplate padrão do Expo — nenhuma tela do produto construída |
| `packages/shared` | Contratos Zod cobrindo praticamente todo o domínio (RF01–RF06); maior parte ainda sem consumidor real na API |

## Lacunas críticas (ordem sugerida de ataque)

1. **Model `Racha` e `RachaMember` no Prisma + módulo na API (RF02).** Sem isso, não
   existe "admin de racha" nem participantes reais — pré-requisito para RF03, RF04 e
   para o RF05 deixar de receber jogadores soltos no body.
2. **Model `Player` + módulo (RF03).** Inclui a lógica de mediana (RF03.4.2), hoje
   inexistente em qualquer lugar do código.
3. **Persistência do histórico de divisões (RF04)**, conectando o motor do AG já
   pronto (RF05/RF06) a um racha e a uma tabela de histórico real.
4. **Telas de produto em `apps/web`/`apps/app`**, hoje inteiramente ausentes.
5. **Observabilidade (Sentry) e infraestrutura de deploy**, antes de expor o sistema
   fora do ambiente local.

## Como manter este documento atualizado

Atualizar a tabela correspondente sempre que um requisito mudar de status, na mesma PR
que faz a implementação (`docs(status): atualiza RF0x para implementado`, seguindo
[`processo/git-workflow.md`](./processo/git-workflow.md)). Não é necessário detalhar o
"porquê" de decisões técnicas aqui — isso pertence a um ADR em
[`decisoes/`](./decisoes), com link a partir da linha correspondente na tabela se fizer
sentido.
