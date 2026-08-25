import { INestApplication } from "@nestjs/common"
import request from 'supertest';
import { PrismaService } from "src/prisma/prisma.service";
import { createTestApp } from "./utils/create-test-app";
import { registerAndLogin } from "./utils/register-and-login";
import { cleanDatabase } from "./utils/clean-database";

describe('(RF05): Divisão de times', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    const fastAlgorithm = { populationSize: 10, generations: 5, crossoverRate: 0.8, mutationRate: 0.1 };

    async function createRachaWithPlayers(name: string, adminEmail: string, memberCount: number) {
        const { cookie: adminCookie, userId: adminId } = await registerAndLogin(app, prisma, adminEmail);
        const rachaResponse = await request(app.getHttpServer())
            .post('/api/rachas')
            .set('Cookie', adminCookie)
            .send({ name });
        const rachaId = rachaResponse.body.id as string;

        const adminPlayer = await prisma.player.findUniqueOrThrow({
            where: { rachaId_userId: { rachaId, userId: adminId } },
        });
        const playerIds = [adminPlayer.id];
        const memberCookies: string[] = [];

        for (let i = 0; i < memberCount; i++) {
            const { cookie: memberCookie, userId: memberId } = await registerAndLogin(app, prisma, `${adminEmail.split('@')[0]}-membro${i}@metanolfc.com`);
            await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/members`)
                .set('Cookie', adminCookie)
                .send({ userId: memberId });
            const player = await prisma.player.findUniqueOrThrow({
                where: { rachaId_userId: { rachaId, userId: memberId } },
            });
            playerIds.push(player.id);
            memberCookies.push(memberCookie);
        }

        return { rachaId, adminCookie, playerIds, memberCookies };
    }

    beforeAll(async () => {
        ({ app, prisma } = await createTestApp());
        await cleanDatabase(prisma);
    })

    afterAll(async () => {
        await app.close()
    })

    describe('Cenários de Sucesso (Caminho Feliz)', () => {

        it('Cenário 1: Admin gera divisão com jogadores reais e o resultado fica no histórico (RF05.1/RF05.7)', async () => {
            const { rachaId, adminCookie, playerIds } = await createRachaWithPlayers('Racha Divisão', 'rf05-admin1@metanolfc.com', 3);

            const response = await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/team-splits/generate`)
                .set('Cookie', adminCookie)
                .send({
                    presentPlayerIds: playerIds,
                    params: { numberOfTeams: 2, playersPerTeam: 2, algorithm: fastAlgorithm },
                });

            expect(response.status).toBe(201);
            expect(response.body.teams).toHaveLength(2);
            expect(typeof response.body.bestFitness).toBe('number');
            const allPlacedIds = response.body.teams.flatMap((t: { playerIds: string[] }) => t.playerIds);
            expect(allPlacedIds.sort()).toEqual([...playerIds].sort());

            const historyResponse = await request(app.getHttpServer())
                .get(`/api/rachas/${rachaId}/team-splits/${response.body.id}`)
                .set('Cookie', adminCookie);

            expect(historyResponse.status).toBe(200);
            expect(historyResponse.body.teams).toHaveLength(2);
        });

        it('Cenário 5: Com "aberto para membros" ligado, um membro comum pode gerar a divisão', async () => {
            const { rachaId, adminCookie, playerIds, memberCookies } = await createRachaWithPlayers('Racha Aberta Membros', 'rf05-admin5@metanolfc.com', 3);
            const memberCookie = memberCookies[0];
            const member = await prisma.users.findFirstOrThrow({
                where: { email: 'rf05-admin5-membro0@metanolfc.com' },
            });

            const toggleResponse = await request(app.getHttpServer())
                .patch(`/api/rachas/${rachaId}/team-split-open-to-members`)
                .set('Cookie', adminCookie)
                .send({ open: true });
            expect(toggleResponse.status).toBe(200);
            expect(toggleResponse.body.teamSplitOpenToMembers).toBe(true);

            const response = await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/team-splits/generate`)
                .set('Cookie', memberCookie)
                .send({
                    presentPlayerIds: playerIds,
                    params: { numberOfTeams: 2, playersPerTeam: 2, algorithm: fastAlgorithm },
                });

            expect(response.status).toBe(201);

            const historyResponse = await request(app.getHttpServer())
                .get(`/api/rachas/${rachaId}/team-splits/${response.body.id}`)
                .set('Cookie', adminCookie);
            expect(historyResponse.status).toBe(200);
            expect(historyResponse.body.createdBy).toBe(member.id);
            expect(historyResponse.body.createdAt).toBeDefined();
        });
    });

    describe('Cenários de Falha (Caminho de Exceção)', () => {

        it('Cenário 2: Membro comum não pode iniciar a divisão', async () => {
            const { rachaId, playerIds, memberCookies } = await createRachaWithPlayers('Racha Restrito Divisão', 'rf05-admin2@metanolfc.com', 3);
            const memberCookie = memberCookies[0];

            const response = await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/team-splits/generate`)
                .set('Cookie', memberCookie)
                .send({
                    presentPlayerIds: playerIds,
                    params: { numberOfTeams: 2, playersPerTeam: 2, algorithm: fastAlgorithm },
                });

            expect(response.status).toBe(403);
        });

        it('Cenário 3: Jogador de outro racha é rejeitado (400)', async () => {
            const { rachaId, adminCookie, playerIds } = await createRachaWithPlayers('Racha A Divisão', 'rf05-admin3a@metanolfc.com', 3);
            const { playerIds: outroPlayerIds } = await createRachaWithPlayers('Racha B Divisão', 'rf05-admin3b@metanolfc.com', 1);

            const response = await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/team-splits/generate`)
                .set('Cookie', adminCookie)
                .send({
                    presentPlayerIds: [...playerIds, outroPlayerIds[0]],
                    params: { numberOfTeams: 2, playersPerTeam: 2, algorithm: fastAlgorithm },
                });

            expect(response.status).toBe(400);
        });

        it('Cenário 4: Requisição sem autenticação é rejeitada', async () => {
            const { rachaId, playerIds } = await createRachaWithPlayers('Racha Sem Auth Divisão', 'rf05-admin4@metanolfc.com', 3);

            const response = await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/team-splits/generate`)
                .send({
                    presentPlayerIds: playerIds,
                    params: { numberOfTeams: 2, playersPerTeam: 2, algorithm: fastAlgorithm },
                });

            expect(response.status).toBe(401);
        });

        it('Cenário 6: Membro comum não pode alterar a configuração "aberto para membros"', async () => {
            const { rachaId, memberCookies } = await createRachaWithPlayers('Racha Config Restrita', 'rf05-admin6@metanolfc.com', 3);
            const memberCookie = memberCookies[0];

            const response = await request(app.getHttpServer())
                .patch(`/api/rachas/${rachaId}/team-split-open-to-members`)
                .set('Cookie', memberCookie)
                .send({ open: true });

            expect(response.status).toBe(403);
        });
    });
})
