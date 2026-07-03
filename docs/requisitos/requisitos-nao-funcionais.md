# Requisitos Não Funcionais — Metanol FC

- Status: em revisão
- Data: 2026-07-03

Escala de referência: até **50 usuários por racha**. Hospedagem inicial na **Vercel**,
com migração planejada para **AWS** mais adiante — ver nota técnica em RNF03.1.

## RNF01 — Performance

- **RNF01.1** Requisições HTTP comuns da API (CRUD de usuário, racha, jogador) devem
  responder em até **500 ms** sob condição normal de uso (p95).
- **RNF01.2** A execução do algoritmo genético de divisão de times (RF05) deve
  concluir em até **5 segundos** para o caso de uso típico (até ~40 jogadores
  presentes), considerando os parâmetros padrão de população/gerações (RF05.6).
  *(sugestão — validar após implementação com medição real; se necessário, executar
  de forma assíncrona com feedback de progresso em vez de bloquear a requisição)*.
- **RNF01.3** As três aplicações (web, mobile) devem exibir feedback de carregamento
  (loading state) para qualquer operação que exceda 300 ms.

## RNF02 — Segurança

- **RNF02.1** Senhas devem ser armazenadas com hash usando algoritmo adequado a senhas
  (ex.: `bcrypt` ou `argon2`), nunca em texto plano ou com hash reversível (RF01.3).
- **RNF02.2** Autenticação via token (ex.: JWT), com expiração configurável e mecanismo
  de renovação (refresh token) para não exigir login repetido no app mobile.
- **RNF02.3** Toda comunicação entre clientes (web/app) e a API deve ocorrer via HTTPS
  em produção e homologação.
- **RNF02.4** Endpoints de autenticação (login, cadastro) devem ter rate limiting para
  mitigar força bruta (ex.: máx. N tentativas por IP/e-mail por minuto).
- **RNF02.5** Toda entrada de dado da API deve ser validada no servidor usando os
  schemas Zod de `packages/shared` — nunca confiar apenas em validação do cliente.
- **RNF02.6** Autorização por papel deve ser verificada no backend em toda ação restrita
  a administrador (RF02.3, RF03.3, RF03.4), independentemente do que a UI permite.
- **RNF02.7** Upload de arquivo `.txt` (RF03.4.1) deve ter limite de tamanho e validação
  de formato antes do processamento, para evitar abuso.

- **RNF03.1** Meta de disponibilidade da API em produção: **99% em janela mensal**,
  compatível com a hospedagem inicial na Vercel.

  > **Nota técnica — Vercel + NestJS.** A Vercel é hospedagem serverless: cada
  > requisição vira uma function stateless com timeout (10s no plano free, 60s no Pro).
  > Isso é compatível com RNF01.1 (500 ms) e RNF01.2 (algoritmo genético em até 5s),
  > mas tem consequências que precisam entrar numa decisão de arquitetura própria
  > (sugestão: registrar como ADR em `docs/decisoes/` quando o deploy for configurado):
  > - Nenhum estado em memória sobrevive entre requisições (rate limiting de RNF02.4,
  >   sessões, cache) — precisa de um store externo (ex.: Redis, ou tabela no banco).
  > - Sem processos de background/cron nativos rodando continuamente — se no futuro
  >   surgir uma tarefa agendada, usar Vercel Cron Jobs ou mover essa parte para fora.
  > - O NestJS precisa do adapter serverless (`@vendia/serverless-express` ou similar)
  >   para rodar como Vercel Function, em vez do servidor HTTP tradicional usado em
  >   `apps/api/src/main.ts` hoje.
  > - A migração planejada para AWS mais adiante deve ser mais simples se essas
  >   decisões já isolarem estado (banco/Redis) do processo da API desde o início.
- **RNF03.2** Erros inesperados na API não devem expor detalhes internos (stack trace,
  queries) ao cliente; devem ser logados no servidor e retornar mensagem genérica.
- **RNF03.3** O ambiente de homologação deve espelhar a configuração de produção o
  suficiente para validar releases antes do merge para `main` (ver
  [`docs/processo/git-workflow.md`](../processo/git-workflow.md)).

## RNF04 — Escalabilidade

- **RNF04.1** Volume de referência: até **50 usuários por racha**, com múltiplos
  rachas ativos simultaneamente. A arquitetura não precisa ser desenhada para escala
  massiva neste momento, mas deve evitar decisões que impeçam crescimento horizontal
  simples — o que já é exigido pela hospedagem serverless na Vercel (RNF03.1).
- **RNF04.2** O algoritmo genético (RF05) deve rodar de forma isolada por requisição,
  sem estado compartilhado entre execuções concorrentes de rachas diferentes.

## RNF05 — Usabilidade e Acessibilidade

- **RNF05.1** A interface web deve ser responsiva, funcionando corretamente em
  larguras de tela de celular, tablet e desktop.
- **RNF05.2** Mensagens de erro exibidas ao usuário (login inválido, formulário
  incompleto, etc.) devem ser específicas e em português, nunca códigos técnicos crus.
- **RNF05.3** Fluxos críticos (cadastro, login, criação de racha, avaliação pública,
  divisão de times) devem ser utilizáveis por um usuário sem treinamento prévio.

## RNF06 — Compatibilidade

- **RNF06.1** Web: suportar as duas versões mais recentes de Chrome, Firefox, Safari e
  Edge.
- **RNF06.2** Mobile (Expo): suportar as versões de iOS e Android ainda mantidas pelo
  Expo SDK utilizado (RF do app usa Expo SDK atual — ver `apps/app/package.json`).

## RNF07 — Manutenibilidade e Qualidade de Código

- **RNF07.1** Todo contrato de dado compartilhado entre `api`, `web` e `app` deve ser
  definido em `packages/shared` (Zod), evitando duplicação de tipos entre as apps.
- **RNF07.2** O código deve passar em lint e typecheck (`pnpm lint`, `pnpm typecheck`)
  como condição de merge do PR (ver `docs/processo/git-workflow.md`).
- **RNF07.3** *(a validar)* Cobertura mínima de testes automatizados para regras de
  negócio críticas — especialmente o algoritmo genético (RF05) e o cálculo de média
  por mediana (RF03.4.2), dado o risco de bugs silenciosos nessas áreas.

## RNF08 — Observabilidade

- **RNF08.1** A API deve registrar logs estruturados de erros e eventos relevantes
  (login, criação de racha, execução de divisão de times), com nível configurável por
  ambiente.
- **RNF08.2** O sistema deve usar **Sentry** para monitoramento de erros desde o
  início, em produção e homologação, nas três aplicações:
  - `apps/api` — SDK `@sentry/nestjs` (captura exceptions não tratadas e erros de
    requisição automaticamente).
  - `apps/web` — SDK `@sentry/react`, com plugin de source maps do Vite
    (`@sentry/vite-plugin`) para stack traces legíveis em produção.
  - `apps/app` — SDK `@sentry/react-native`, que já inclui o config plugin do Expo
    (`expo` no `app.json`/`app.config.ts`); funciona em builds via EAS.
  - Um projeto Sentry por aplicação (mesma organização), para não misturar erros de
    frontend/mobile/backend no mesmo feed.
  - O plano gratuito do Sentry (Developer, ~5 mil eventos/mês) é suficiente para a
    escala inicial (RNF04.1) e serve como ponto de partida antes de avaliar um plano
    pago.
  - Configuração real (DSNs, variáveis de ambiente por app) fica para quando a
    infraestrutura de deploy for montada — este item define apenas a ferramenta e a
    abordagem, não a implementação.

## RNF09 — Privacidade e Dados Pessoais

- **RNF09.1** O sistema coleta dados pessoais (nome, e-mail, apelido) — deve seguir
  princípios de minimização de dados (RF01.1 já limita aos campos necessários).
- **RNF09.2** *(adiado — ver "Decisões adiadas")* Conformidade formal com a LGPD (ex.:
  exclusão de conta, exportação de dados) fica para uma fase posterior, fora do escopo
  da primeira versão.
- **RNF09.3** Notas individuais da avaliação pública (RF03.4.2) não devem expor
  publicamente *quem* deu qual nota — apenas o resultado agregado (mediana) é público,
  preservando o anonimato do avaliador.

## RNF10 — Backup e Recuperação de Dados

- **RNF10.1** *(adiado — ver "Decisões adiadas")* Estratégia de backup depende do
  provedor de banco de dados escolhido, ainda não definido.

## Questões em aberto

Nenhuma pendência bloqueante para o MVP no momento.

## Decisões adiadas (backlog)

Itens conscientemente fora do escopo da primeira versão, mas que não devem ser
esquecidos conforme o produto avança:

1. **RNF09.2 — Conformidade com LGPD.** Tratar formalmente mais à frente (exclusão de
   conta, exportação/portabilidade de dados, política de privacidade). Como o sistema
   já coleta dados pessoais desde o RF01, vale revisitar este item antes de abrir o
   sistema para um público maior que o círculo inicial de usuários.
2. **RNF10.1 — Gestão e backup do banco de dados.** Depende da escolha do provedor de
   banco (a definir junto com a infraestrutura de deploy — Vercel inicialmente, AWS
   depois). Ao decidir, registrar a escolha e a estratégia de backup como ADR em
   [`docs/decisoes/`](../decisoes).
