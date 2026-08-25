import { INestApplication } from "@nestjs/common"
import request from 'supertest';
import { PrismaService } from "src/prisma/prisma.service";
import { createTestApp } from "./utils/create-test-app";
import { registerAndLogin } from "./utils/register-and-login";

describe('(RF03): Jogadores e avaliações', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    async function createRachaWithAdmin(name: string, adminEmail: string) {
        const { cookie: adminCookie, userId: adminId } = await registerAndLogin(app, prisma, adminEmail);
        const rachaResponse = await request(app.getHttpServer())
            .post('/api/rachas')
            .set('Cookie', adminCookie)
            .send({ name });
        return { rachaId: rachaResponse.body.id as string, adminCookie, adminId };
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
        await prisma.evaluation.deleteMany();
        await prisma.player.deleteMany();
        await prisma.rachaMember.deleteMany();
        await prisma.racha.deleteMany();
        await prisma.users.deleteMany();
    })

    afterAll(async () => {
        await app.close()
    })

    describe('Cenários de Sucesso (Caminho Feliz)', () => {

        it('Cenário 1: Listagem de jogadores do racha (RF03.1/RF03.2)', async () => {
            const { rachaId, adminCookie } = await createRachaWithAdmin('Racha Listagem', 'rf03-admin1@metanolfc.com');

            const response = await request(app.getHttpServer())
                .get(`/api/rachas/${rachaId}/players`)
                .set('Cookie', adminCookie);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].average).toBeNull();
        });

        it('Cenário 2: Admin atualiza gols e assistências (RF03.3)', async () => {
            const { rachaId, adminCookie } = await createRachaWithAdmin('Racha Stats', 'rf03-admin2@metanolfc.com');
            const { playerId } = await addMember(rachaId, adminCookie, 'rf03-membro2@metanolfc.com');

            const response = await request(app.getHttpServer())
                .patch(`/api/rachas/${rachaId}/players/${playerId}/stats`)
                .set('Cookie', adminCookie)
                .send({ goals: 5, assists: 2 });

            expect(response.status).toBe(200);
            expect(response.body.goals).toBe(5);
            expect(response.body.assists).toBe(2);
        });

        it('Cenário 3: Upload de .txt com médias manuais vira fallback (RF03.4.1)', async () => {
            const { rachaId, adminCookie } = await createRachaWithAdmin('Racha Upload', 'rf03-admin3@metanolfc.com');
            const { memberId } = await addMember(rachaId, adminCookie, 'rf03-membro3@metanolfc.com');
            const member = await prisma.users.findUniqueOrThrow({ where: { id: memberId } });

            const fileContent = `${member.email};4,5\n`;
            const response = await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/players/import-averages`)
                .set('Cookie', adminCookie)
                .attach('file', Buffer.from(fileContent), 'medias.txt');

            expect(response.status).toBe(201);
            expect(response.body[0].status).toBe('ok');

            const listResponse = await request(app.getHttpServer())
                .get(`/api/rachas/${rachaId}/players`)
                .set('Cookie', adminCookie);
            const memberPlayer = listResponse.body.find((p: { userId: string }) => p.userId === memberId);
            expect(memberPlayer.average).toBe(4.5);
        });

        it('Cenário 4: Avaliação pública vira mediana e prevalece sobre o valor manual (RF03.4.2)', async () => {
            const { rachaId, adminCookie } = await createRachaWithAdmin('Racha Avaliação', 'rf03-admin4@metanolfc.com');
            const { playerId: targetPlayerId, memberId: targetUserId } = await addMember(rachaId, adminCookie, 'rf03-alvo4@metanolfc.com');
            const { memberCookie: evaluator1Cookie } = await addMember(rachaId, adminCookie, 'rf03-avaliador4a@metanolfc.com');
            const { memberCookie: evaluator2Cookie } = await addMember(rachaId, adminCookie, 'rf03-avaliador4b@metanolfc.com');

            const targetUser = await prisma.users.findUniqueOrThrow({ where: { id: targetUserId } });
            await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/players/import-averages`)
                .set('Cookie', adminCookie)
                .attach('file', Buffer.from(`${targetUser.email};1\n`), 'medias.txt');

            await request(app.getHttpServer())
                .patch(`/api/rachas/${rachaId}/evaluations-open`)
                .set('Cookie', adminCookie)
                .send({ open: true });

            await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/evaluations`)
                .set('Cookie', evaluator1Cookie)
                .send({ evaluatedPlayerId: targetPlayerId, score: 4 });

            const secondResponse = await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/evaluations`)
                .set('Cookie', evaluator2Cookie)
                .send({ evaluatedPlayerId: targetPlayerId, score: 5 });

            expect(secondResponse.status).toBe(201);

            const listResponse = await request(app.getHttpServer())
                .get(`/api/rachas/${rachaId}/players`)
                .set('Cookie', adminCookie);
            const targetPlayer = listResponse.body.find((p: { id: string }) => p.id === targetPlayerId);
            expect(targetPlayer.average).toBe(4.5);
        });
    });

    describe('Cenários de Falha (Caminho de Exceção)', () => {

        it('Cenário 5: Membro comum não pode atualizar estatísticas de outro jogador', async () => {
            const { rachaId, adminCookie } = await createRachaWithAdmin('Racha Restrito Stats', 'rf03-admin5@metanolfc.com');
            const { memberCookie, playerId } = await addMember(rachaId, adminCookie, 'rf03-membro5@metanolfc.com');

            const response = await request(app.getHttpServer())
                .patch(`/api/rachas/${rachaId}/players/${playerId}/stats`)
                .set('Cookie', memberCookie)
                .send({ goals: 1 });

            expect(response.status).toBe(403);
        });

        it('Cenário 6: Jogador não pode avaliar a si mesmo', async () => {
            const { rachaId, adminCookie } = await createRachaWithAdmin('Racha Autoavaliação', 'rf03-admin6@metanolfc.com');
            const { memberCookie, playerId } = await addMember(rachaId, adminCookie, 'rf03-membro6@metanolfc.com');

            await request(app.getHttpServer())
                .patch(`/api/rachas/${rachaId}/evaluations-open`)
                .set('Cookie', adminCookie)
                .send({ open: true });

            const response = await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/evaluations`)
                .set('Cookie', memberCookie)
                .send({ evaluatedPlayerId: playerId, score: 3 });

            expect(response.status).toBe(400);
        });

        it('Cenário 7: Avaliação rejeitada quando o período está fechado', async () => {
            const { rachaId, adminCookie } = await createRachaWithAdmin('Racha Fechado', 'rf03-admin7@metanolfc.com');
            const { playerId: targetPlayerId } = await addMember(rachaId, adminCookie, 'rf03-alvo7@metanolfc.com');
            const { memberCookie: evaluatorCookie } = await addMember(rachaId, adminCookie, 'rf03-avaliador7@metanolfc.com');

            const response = await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/evaluations`)
                .set('Cookie', evaluatorCookie)
                .send({ evaluatedPlayerId: targetPlayerId, score: 3 });

            expect(response.status).toBe(403);
        });

        it('Cenário 8: Avaliar o mesmo jogador duas vezes é rejeitado (409)', async () => {
            const { rachaId, adminCookie } = await createRachaWithAdmin('Racha Duplicidade Avaliação', 'rf03-admin8@metanolfc.com');
            const { playerId: targetPlayerId } = await addMember(rachaId, adminCookie, 'rf03-alvo8@metanolfc.com');
            const { memberCookie: evaluatorCookie } = await addMember(rachaId, adminCookie, 'rf03-avaliador8@metanolfc.com');

            await request(app.getHttpServer())
                .patch(`/api/rachas/${rachaId}/evaluations-open`)
                .set('Cookie', adminCookie)
                .send({ open: true });

            await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/evaluations`)
                .set('Cookie', evaluatorCookie)
                .send({ evaluatedPlayerId: targetPlayerId, score: 3 });

            const response = await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/evaluations`)
                .set('Cookie', evaluatorCookie)
                .send({ evaluatedPlayerId: targetPlayerId, score: 4 });

            expect(response.status).toBe(409);
        });
    });
})
