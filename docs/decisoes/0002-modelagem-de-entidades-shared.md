# 0002 — Modelagem de entidades em `packages/shared`

- Status: aprovado
- Data: 2026-07-03

## Contexto

Com os requisitos funcionais (RF01–RF06) e não funcionais definidos, era necessário
modelar as entidades de domínio como schemas Zod em `packages/shared`, para serem
consumidas por `apps/api`, `apps/web` e `apps/app` a partir de uma única fonte de
verdade.

## Decisão

Entidades modeladas, uma por arquivo em `packages/shared/src/schemas/`:

- `user.schema.ts` — `User`, `RegisterUserInput`, `LoginInput`, `UpdateUserProfileInput`.
- `racha.schema.ts` — `Racha` (com `evaluationsOpen`), `CreateRachaInput`,
  `UpdateRachaInput`, `SetEvaluationsOpenInput`.
- `racha-member.schema.ts` — `RachaMember` (papel `admin`/`member` por racha),
  `AddRachaMemberInput`, `RemoveRachaMemberInput`, `SetRachaMemberRoleInput`.
- `player.schema.ts` — `Player` (`goals`, `assists`, `manualAverage`, `average`),
  `UpdatePlayerStatsInput`, `ImportPlayerAveragesInput`.
- `evaluation.schema.ts` — `Evaluation`, `CreateEvaluationInput`.
- `team-split.schema.ts` — `TeamSplitParams`, `GeneticAlgorithmParams` (com valores
  padrão), `CreateTeamSplitInput`, `TeamSplit` (histórico).

Pontos de modelagem que exigiram uma escolha explícita:

1. **`role` não é mais um campo global em `User`.** Passou a viver em `RachaMember`,
   já que administrador é um papel por racha, não do usuário como um todo (RF02.4).
2. **`Player.average` é separado de `Player.manualAverage`.** `manualAverage` guarda o
   valor bruto importado via `.txt` (RF03.4.1); `average` é o valor efetivo exibido e
   usado pelo sistema — mediana das avaliações públicas quando existirem, com fallback
   para `manualAverage` (RF03.4). O cálculo em si é lógica de negócio da API, não faz
   parte do schema.
3. **`Evaluation` referencia `Player`, não `User`, diretamente.** Evita ambiguidade,
   já que médias são específicas por racha (RF03.2). Não existe schema de atualização
   de avaliação — a ausência é intencional, pois a avaliação é imutável após o envio
   (RF03.4.2); a regra "não pode avaliar a si mesmo" é aplicada via `.refine()` no
   próprio `createEvaluationSchema`, validada de forma idêntica em api/web/app.
4. **`Racha.schedule` é texto livre** (ex.: "Terças, 20h"), em vez de campos
   estruturados de dia da semana/horário — o requisito original (RF02.1) não detalhava
   o formato.
5. **`teamSplitParamsSchema` não valida `numberOfTeams × playersPerTeam` contra o
   total de jogadores presentes.** Essa validação cruzada e a regra de distribuição de
   sobra (RF06.3) ficam para a camada de serviço da API, não para o schema.

## Consequências

- Qualquer mudança nessas entidades deve começar em `packages/shared`; api/web/app
  consomem os tipos derivados via `z.infer`, sem duplicar definições.
- Pontos 1–5 acima são decisões reversíveis, mas qualquer mudança neles é uma alteração de
  contrato compartilhado — considerar `feat(shared)!` (breaking change) conforme
  [`docs/processo/git-workflow.md`](../processo/git-workflow.md) se alterarem o shape
  de um schema já em uso.
