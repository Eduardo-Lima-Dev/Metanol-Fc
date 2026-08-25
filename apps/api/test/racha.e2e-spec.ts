import { INestApplication } from "@nestjs/common"
import request from 'supertest';
import { PrismaService } from "src/prisma/prisma.service";
import { createTestApp } from "./utils/create-test-app";
import { registerAndLogin as registerAndLoginUtil } from "./utils/register-and-login";
import { cleanDatabase } from "./utils/clean-database";

describe('(RF02): Gerenciamento de rachas', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    function registerAndLogin(email: string, name = 'Usuário Teste') {
        return registerAndLoginUtil(app, prisma, email, name);
    }

    beforeAll(async () => {
        ({ app, prisma } = await createTestApp());
        await cleanDatabase(prisma);
    })

    afterAll(async () => {
        await app.close()
    })

    describe('Cenários de Sucesso (Caminho Feliz)', () => {

        it('Cenário 1: Criador do racha vira admin automaticamente (RF02.1/RF02.2)', async () => {
            const { cookie, userId } = await registerAndLogin('rf02-admin1@metanolfc.com');

            const response = await request(app.getHttpServer())
                .post('/api/rachas')
                .set('Cookie', cookie)
                .send({ name: 'Pelada de Sábado', schedule: 'Sábados, 10h' });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe('Pelada de Sábado');
            expect(response.body.createdBy).toBe(userId);

            const membership = await prisma.rachaMember.findUnique({
                where: { rachaId_userId: { rachaId: response.body.id, userId } },
            });
            expect(membership?.role).toBe('admin');

            const player = await prisma.player.findUnique({
                where: { rachaId_userId: { rachaId: response.body.id, userId } },
            });
            expect(player).not.toBeNull();
        });

        it('Cenário 2: Listagem de rachas do usuário com o papel exercido (RF02.5)', async () => {
            const { cookie } = await registerAndLogin('rf02-admin2@metanolfc.com');

            await request(app.getHttpServer())
                .post('/api/rachas')
                .set('Cookie', cookie)
                .send({ name: 'Racha da Firma' });

            const response = await request(app.getHttpServer())
                .get('/api/rachas')
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].role).toBe('admin');
        });

        it('Cenário 3: Admin adiciona participante, que passa a integrar o racha (RF02.3)', async () => {
            const { cookie: adminCookie } = await registerAndLogin('rf02-admin3@metanolfc.com');
            const { userId: memberId } = await registerAndLogin('rf02-membro3@metanolfc.com');

            const rachaResponse = await request(app.getHttpServer())
                .post('/api/rachas')
                .set('Cookie', adminCookie)
                .send({ name: 'Racha com Membro' });
            const rachaId = rachaResponse.body.id as string;

            const addResponse = await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/members`)
                .set('Cookie', adminCookie)
                .send({ userId: memberId });

            expect(addResponse.status).toBe(201);

            const membership = await prisma.rachaMember.findUnique({
                where: { rachaId_userId: { rachaId, userId: memberId } },
            });
            expect(membership?.role).toBe('member');
        });

        it('Cenário 4: Admin promove outro membro a admin unilateralmente (RF02.4)', async () => {
            const { cookie: adminCookie } = await registerAndLogin('rf02-admin4@metanolfc.com');
            const { userId: memberId } = await registerAndLogin('rf02-membro4@metanolfc.com');

            const rachaResponse = await request(app.getHttpServer())
                .post('/api/rachas')
                .set('Cookie', adminCookie)
                .send({ name: 'Racha com Promoção' });
            const rachaId = rachaResponse.body.id as string;

            await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/members`)
                .set('Cookie', adminCookie)
                .send({ userId: memberId });

            const promoteResponse = await request(app.getHttpServer())
                .patch(`/api/rachas/${rachaId}/members/${memberId}/role`)
                .set('Cookie', adminCookie)
                .send({ role: 'admin' });

            expect(promoteResponse.status).toBe(200);
            expect(promoteResponse.body.role).toBe('admin');
        });

        it('Cenário 4.1: Lista membros do racha com nome e papel (RF02.3)', async () => {
            const { cookie: adminCookie, userId: adminId } = await registerAndLogin('rf02-admin4-1@metanolfc.com', 'Admin Um');
            const { userId: memberId } = await registerAndLogin('rf02-membro4-1@metanolfc.com', 'Membro Um');

            const rachaResponse = await request(app.getHttpServer())
                .post('/api/rachas')
                .set('Cookie', adminCookie)
                .send({ name: 'Racha com Lista de Membros' });
            const rachaId = rachaResponse.body.id as string;

            await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/members`)
                .set('Cookie', adminCookie)
                .send({ userId: memberId });

            const response = await request(app.getHttpServer())
                .get(`/api/rachas/${rachaId}/members`)
                .set('Cookie', adminCookie);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);

            const admin = response.body.find((m: { userId: string }) => m.userId === adminId);
            const member = response.body.find((m: { userId: string }) => m.userId === memberId);
            expect(admin.role).toBe('admin');
            expect(admin.name).toBe('Admin Um');
            expect(member.role).toBe('member');
            expect(member.name).toBe('Membro Um');
        });
    });

    describe('Cenários de Falha (Caminho de Exceção)', () => {

        it('Cenário 5: Membro comum não pode adicionar participantes', async () => {
            const { cookie: adminCookie } = await registerAndLogin('rf02-admin5@metanolfc.com');
            const { cookie: memberCookie, userId: memberId } = await registerAndLogin('rf02-membro5@metanolfc.com');
            const { userId: outroId } = await registerAndLogin('rf02-outro5@metanolfc.com');

            const rachaResponse = await request(app.getHttpServer())
                .post('/api/rachas')
                .set('Cookie', adminCookie)
                .send({ name: 'Racha Restrito' });
            const rachaId = rachaResponse.body.id as string;

            await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/members`)
                .set('Cookie', adminCookie)
                .send({ userId: memberId });

            const response = await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/members`)
                .set('Cookie', memberCookie)
                .send({ userId: outroId });

            expect(response.status).toBe(403);
        });

        it('Cenário 6: Não é possível remover o último administrador do racha', async () => {
            const { cookie: adminCookie, userId: adminId } = await registerAndLogin('rf02-admin6@metanolfc.com');

            const rachaResponse = await request(app.getHttpServer())
                .post('/api/rachas')
                .set('Cookie', adminCookie)
                .send({ name: 'Racha Órfão' });
            const rachaId = rachaResponse.body.id as string;

            const response = await request(app.getHttpServer())
                .delete(`/api/rachas/${rachaId}/members/${adminId}`)
                .set('Cookie', adminCookie);

            expect(response.status).toBe(400);
        });

        it('Cenário 7: Requisição sem autenticação é rejeitada', async () => {
            const response = await request(app.getHttpServer()).get('/api/rachas');
            expect(response.status).toBe(401);
        });

        it('Cenário 8: Adicionar o mesmo membro duas vezes é rejeitado (409)', async () => {
            const { cookie: adminCookie } = await registerAndLogin('rf02-admin8@metanolfc.com');
            const { userId: memberId } = await registerAndLogin('rf02-membro8@metanolfc.com');

            const rachaResponse = await request(app.getHttpServer())
                .post('/api/rachas')
                .set('Cookie', adminCookie)
                .send({ name: 'Racha Duplicidade' });
            const rachaId = rachaResponse.body.id as string;

            await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/members`)
                .set('Cookie', adminCookie)
                .send({ userId: memberId });

            const response = await request(app.getHttpServer())
                .post(`/api/rachas/${rachaId}/members`)
                .set('Cookie', adminCookie)
                .send({ userId: memberId });

            expect(response.status).toBe(409);
        });
    });
})
