import { INestApplication } from "@nestjs/common"
import request from 'supertest';
import { PrismaService } from "src/prisma/prisma.service";
import { createTestApp } from "./utils/create-test-app";
import { registerAndLogin } from "./utils/register-and-login";
import { cleanDatabase } from "./utils/clean-database";

describe('(RF04): Histórico de divisões', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    const defaultParams = {
        numberOfTeams: 2,
        playersPerTeam: 3,
        weights: { average: 1, goals: 1, assists: 1 },
        algorithm: { populationSize: 50, generations: 200, crossoverRate: 0.8, mutationRate: 0.05 },
    };

    async function createRachaWithAdmin(name: string, adminEmail: string) {
        const { cookie: adminCookie, userId: adminId } = await registerAndLogin(app, prisma, adminEmail);
        const rachaResponse = await request(app.getHttpServer())
            .post('/api/rachas')
            .set('Cookie', adminCookie)
            .send({ name });
        return { rachaId: rachaResponse.body.id as string, adminCookie, adminId };
    }

    async function seedTeamSplit(rachaId: string, createdBy: string, teams: { index: number; playerIds: string[] }[]) {
        return prisma.teamSplit.create({
            data: { rachaId, createdBy, params: defaultParams, teams },
        });
    }

    beforeAll(async () => {
        ({ app, prisma } = await createTestApp());
        await cleanDatabase(prisma);
    })

    afterAll(async () => {
        await app.close()
    })

    describe('Cenários de Sucesso (Caminho Feliz)', () => {

        it('Cenário 1: Lista o histórico ordenado por data, mais recente primeiro (RF04.2)', async () => {
            const { rachaId, adminCookie, adminId } = await createRachaWithAdmin('Racha Histórico', 'rf04-admin1@metanolfc.com');

            const first = await seedTeamSplit(rachaId, adminId, [{ index: 0, playerIds: [adminId] }]);
            await new Promise((resolve) => setTimeout(resolve, 10));
            const second = await seedTeamSplit(rachaId, adminId, [{ index: 0, playerIds: [adminId] }]);

            const response = await request(app.getHttpServer())
                .get(`/api/rachas/${rachaId}/team-splits`)
                .set('Cookie', adminCookie);

            expect(response.status).toBe(200);
            expect(response.body.items).toHaveLength(2);
            expect(response.body.items[0].id).toBe(second.id);
            expect(response.body.items[1].id).toBe(first.id);
            expect(response.body.total).toBe(2);
        });

        it('Cenário 2: Paginação respeita page/pageSize', async () => {
            const { rachaId, adminCookie, adminId } = await createRachaWithAdmin('Racha Paginação', 'rf04-admin2@metanolfc.com');

            for (let i = 0; i < 3; i++) {
                await seedTeamSplit(rachaId, adminId, [{ index: 0, playerIds: [adminId] }]);
            }

            const response = await request(app.getHttpServer())
                .get(`/api/rachas/${rachaId}/team-splits`)
                .query({ page: 1, pageSize: 2 })
                .set('Cookie', adminCookie);

            expect(response.status).toBe(200);
            expect(response.body.items).toHaveLength(2);
            expect(response.body.page).toBe(1);
            expect(response.body.pageSize).toBe(2);
            expect(response.body.total).toBe(3);
        });

        it('Cenário 3: Detalhe de uma divisão inclui os parâmetros usados (RF04.3)', async () => {
            const { rachaId, adminCookie, adminId } = await createRachaWithAdmin('Racha Detalhe', 'rf04-admin3@metanolfc.com');
            const teamSplit = await seedTeamSplit(rachaId, adminId, [{ index: 0, playerIds: [adminId] }]);

            const response = await request(app.getHttpServer())
                .get(`/api/rachas/${rachaId}/team-splits/${teamSplit.id}`)
                .set('Cookie', adminCookie);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(teamSplit.id);
            expect(response.body.params.numberOfTeams).toBe(2);
            expect(response.body.teams).toHaveLength(1);
        });
    });

    describe('Cenários de Falha (Caminho de Exceção)', () => {

        it('Cenário 4: Usuário que não participa do racha recebe 403', async () => {
            const { rachaId } = await createRachaWithAdmin('Racha Privado', 'rf04-admin4@metanolfc.com');
            const { cookie: outroCookie } = await registerAndLogin(app, prisma, 'rf04-outro4@metanolfc.com');

            const response = await request(app.getHttpServer())
                .get(`/api/rachas/${rachaId}/team-splits`)
                .set('Cookie', outroCookie);

            expect(response.status).toBe(403);
        });

        it('Cenário 5: Divisão inexistente retorna 404', async () => {
            const { rachaId, adminCookie } = await createRachaWithAdmin('Racha 404', 'rf04-admin5@metanolfc.com');

            const response = await request(app.getHttpServer())
                .get(`/api/rachas/${rachaId}/team-splits/00000000-0000-0000-0000-000000000000`)
                .set('Cookie', adminCookie);

            expect(response.status).toBe(404);
        });

        it('Cenário 6: Requisição sem autenticação é rejeitada', async () => {
            const { rachaId } = await createRachaWithAdmin('Racha Sem Auth', 'rf04-admin6@metanolfc.com');

            const response = await request(app.getHttpServer())
                .get(`/api/rachas/${rachaId}/team-splits`);

            expect(response.status).toBe(401);
        });
    });
})
