# 0001 — Estrutura do monorepo

- Status: aprovado
- Data: 2026-07-03

## Contexto

O sistema Metanol FC é composto por três aplicações — API (NestJS), Web (React) e App
mobile (React Native/Expo) — que compartilham modelos de domínio e validações.

## Decisão

- Monorepo gerenciado com **pnpm workspaces** + **Turborepo** para orquestração de build/dev/lint.
- `apps/api` — NestJS.
- `apps/web` — React + Vite.
- `apps/app` — React Native + Expo.
- `packages/shared` — schemas Zod e tipos TypeScript compartilhados entre as três aplicações.
- `docs/` — documentação de produto e técnica (requisitos, arquitetura, ADRs, contratos de API).

## Consequências

- Por api/web/app serem todos TypeScript, `packages/shared` pode ser consumido diretamente
  por todos sem geração de código intermediária.
- `packages/shared` é compilado para `dist/` (CommonJS) via `tsc`; o Turborepo garante que o
  build do `shared` roda antes das apps que dependem dele (`dependsOn: ["^build"]`).
- O Metro bundler (Expo) precisa de configuração extra (`metro.config.js`) para resolver
  pacotes do workspace corretamente com pnpm (symlinks).
