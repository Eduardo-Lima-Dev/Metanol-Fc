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

    async function addMember(rachaId: string, adminCookie: string, memberEmail: string) {
        const { cookie: memberCookie, userId: memberId } = await registerAndLogin(app, prisma, memberEmail);
        await request(app.getHttpServer())
            .post(`/api/rachas/${rachaId}/members`)
            .set('Cookie', adminCookie)
            .send({ userId: memberId });
        const player = await prisma.player.findUniqueOrThrow({
            where: { rachaId_userId: { rachaId, userId: memberId } },
        });
        return { memberCookie, memberId, playerId: player.id };
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
            expect(response.body.createdByName).toBe('Usuário Teste');
        });

        it('Cenário 7: Admin registra o time vencedor de uma divisão', async () => {
            const { rachaId, adminCookie, adminId } = await createRachaWithAdmin('Racha Resultado', 'rf04-admin7@metanolfc.com');
            const { playerId } = await addMember(rachaId, adminCookie, 'rf04-membro7@metanolfc.com');
            const teamSplit = await seedTeamSplit(rachaId, adminId, [
                { index: 0, playerIds: [playerId] },
                { index: 1, playerIds: [adminId] },
            ]);

            const response = await request(app.getHttpServer())
                .patch(`/api/rachas/${rachaId}/team-splits/${teamSplit.id}/result`)
                .set('Cookie', adminCookie)
                .send({ outcome: 'team_win', winningTeamIndex: 0 });

            expect(response.status).toBe(200);
            expect(response.body.outcome).toBe('team_win');
            expect(response.body.winningTeamIndex).toBe(0);
            expect(response.body.resultRecordedByName).toBe('Usuário Teste');
        });

        it('Cenário 8: Admin registra empate', async () => {
            const { rachaId, adminCookie, adminId } = await createRachaWithAdmin('Racha Empate', 'rf04-admin8@metanolfc.com');
            const teamSplit = await seedTeamSplit(rachaId, adminId, [{ index: 0, playerIds: [adminId] }]);

            const response = await request(app.getHttpServer())
                .patch(`/api/rachas/${rachaId}/team-splits/${teamSplit.id}/result`)
                .set('Cookie', adminCookie)
                .send({ outcome: 'draw' });

            expect(response.status).toBe(200);
            expect(response.body.outcome).toBe('draw');
            expect(response.body.winningTeamIndex).toBeNull();
        });

        it('Cenário 9: Ranking agrega vitórias por jogador entre divisões diferentes', async () => {
            const { rachaId, adminCookie, adminId } = await createRachaWithAdmin('Racha Ranking', 'rf04-admin9@metanolfc.com');
            const { playerId: memberPlayerId } = await addMember(rachaId, adminCookie, 'rf04-membro9@metanolfc.com');
            const adminPlayer = await prisma.player.findUniqueOrThrow({
                where: { rachaId_userId: { rachaId, userId: adminId } },
            });

            // Divisão 1: admin (time 0) vence, com o membro no time perdedor.
            const split1 = await seedTeamSplit(rachaId, adminId, [
                { index: 0, playerIds: [adminPlayer.id] },
                { index: 1, playerIds: [memberPlayerId] },
            ]);
            await request(app.getHttpServer())
                .patch(`/api/rachas/${rachaId}/team-splits/${split1.id}/result`)
                .set('Cookie', adminCookie)
                .send({ outcome: 'team_win', winningTeamIndex: 0 });

            // Divisão 2: dessa vez o time do admin (ainda índice 0) perde.
            const split2 = await seedTeamSplit(rachaId, adminId, [
                { index: 0, playerIds: [adminPlayer.id] },
                { index: 1, playerIds: [memberPlayerId] },
            ]);
            await request(app.getHttpServer())
                .patch(`/api/rachas/${rachaId}/team-splits/${split2.id}/result`)
                .set('Cookie', adminCookie)
                .send({ outcome: 'team_win', winningTeamIndex: 1 });

            const response = await request(app.getHttpServer())
                .get(`/api/rachas/${rachaId}/team-splits/ranking`)
                .set('Cookie', adminCookie);

            expect(response.status).toBe(200);
            const entries = response.body as Array<{ playerId: string; wins: number }>;
            expect(entries.find((e) => e.playerId === adminPlayer.id)?.wins).toBe(1);
            expect(entries.find((e) => e.playerId === memberPlayerId)?.wins).toBe(1);
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

        it('Cenário 10: Índice de time vencedor inválido é rejeitado (400)', async () => {
            const { rachaId, adminCookie, adminId } = await createRachaWithAdmin('Racha Índice Inválido', 'rf04-admin10@metanolfc.com');
            const teamSplit = await seedTeamSplit(rachaId, adminId, [{ index: 0, playerIds: [adminId] }]);

            const response = await request(app.getHttpServer())
                .patch(`/api/rachas/${rachaId}/team-splits/${teamSplit.id}/result`)
                .set('Cookie', adminCookie)
                .send({ outcome: 'team_win', winningTeamIndex: 5 });

            expect(response.status).toBe(400);
        });

        it('Cenário 11: Membro comum não pode registrar o resultado', async () => {
            const { rachaId, adminCookie, adminId } = await createRachaWithAdmin('Racha Resultado Restrito', 'rf04-admin11@metanolfc.com');
            const { memberCookie } = await addMember(rachaId, adminCookie, 'rf04-membro11@metanolfc.com');
            const teamSplit = await seedTeamSplit(rachaId, adminId, [{ index: 0, playerIds: [adminId] }]);

            const response = await request(app.getHttpServer())
                .patch(`/api/rachas/${rachaId}/team-splits/${teamSplit.id}/result`)
                .set('Cookie', memberCookie)
                .send({ outcome: 'draw' });

            expect(response.status).toBe(403);
        });
    });
})
