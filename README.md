# Metanol FC

Monorepo do sistema Metanol FC.

## Estrutura

```
apps/
  api/      NestJS — API
  web/      React + Vite — Web
  app/      React Native + Expo — Mobile
packages/
  shared/   Schemas Zod e tipos TypeScript compartilhados
docs/       Documentação de produto e técnica
```

## Requisitos

- Node.js >= 20
- pnpm 8

## Uso

```bash
pnpm install

# Rodar tudo em paralelo (api, web, app)
pnpm dev

# Rodar uma app específica
pnpm --filter @metanol/api dev
pnpm --filter @metanol/web dev
pnpm --filter @metanol/app dev

# Build de tudo (respeitando a ordem de dependências)
pnpm build

# Typecheck de tudo
pnpm typecheck
```

## Pacote compartilhado

`packages/shared` contém schemas [Zod](https://zod.dev) e os tipos TypeScript derivados
deles, usados por `api`, `web` e `app`. Qualquer contrato de dados (modelos de domínio,
DTOs de entrada/saída) deve ser definido lá para garantir que as três aplicações fiquem
sempre em sincronia.

Documentação completa em [`docs/`](./docs).
