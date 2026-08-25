# API — Contratos e documentação

Documentação dos endpoints da API (`apps/api`), autenticação, versionamento e convenções
de resposta/erro.

Considerar usar `@nestjs/swagger` na API para gerar um spec OpenAPI navegável, mantendo este
diretório para decisões de design da API que não são autoexplicadas pelo spec (ex: estratégia
de autenticação, rate limiting, convenções de erro).

## Coleção do Insomnia

[`metanol-fc.insomnia.json`](./metanol-fc.insomnia.json) — coleção pronta pra importar no
Insomnia (`Application Menu` → `Import/Export` → `Import Data` → `From File`), com o fluxo de
ponta a ponta: cadastro/login de 3 usuários, perfil (RF01.5), rachas (RF02), jogadores +
avaliações com abstenção e jogador avulso (RF03), divisão de times + histórico + resultado +
ranking de vitórias (RF04/RF05/RF06), e uma pasta com cenários de erro (403/400/409/404/401).
As pastas numeradas (01–07) indicam a ordem de execução; a autenticação é via cookie httpOnly,
gerenciada automaticamente pelo cookie jar do workspace do Insomnia — cada requisição de
"Login" troca qual usuário fica autenticado nas requisições seguintes. Alguns valores (ids de
racha, jogador, divisão) precisam ser copiados manualmente das respostas para as variáveis de
ambiente da coleção, conforme indicado na descrição de cada requisição.
