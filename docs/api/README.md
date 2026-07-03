# API — Contratos e documentação

Documentação dos endpoints da API (`apps/api`), autenticação, versionamento e convenções
de resposta/erro.

Considerar usar `@nestjs/swagger` na API para gerar um spec OpenAPI navegável, mantendo este
diretório para decisões de design da API que não são autoexplicadas pelo spec (ex: estratégia
de autenticação, rate limiting, convenções de erro).
