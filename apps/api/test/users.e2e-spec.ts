import { INestApplication } from "@nestjs/common"
import request from 'supertest';
import { PrismaService } from "src/prisma/prisma.service";
import { createTestApp } from "./utils/create-test-app";
import { cleanDatabase } from "./utils/clean-database";

describe('(RF01.5): Edição de perfil', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    async function registerAndLogin(email: string, name = 'Usuário Teste', password = 'SenhaForte123!') {
        await request(app.getHttpServer())
            .post('/api/auth/register')
            .send({ name, email, password });

        const response = await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({ email, password });

        return response.headers['set-cookie'][0] as string;
    }

    beforeAll(async () => {
        ({ app, prisma } = await createTestApp());
        await cleanDatabase(prisma);
    })

    afterAll(async () => {
        await app.close()
    })

    describe('Cenários de Sucesso (Caminho Feliz)', () => {

        it('Cenário 1: Consulta os próprios dados sem expor a senha', async () => {
            const cookie = await registerAndLogin('perfil1@metanolfc.com');

            const response = await request(app.getHttpServer())
                .get('/api/users/me')
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body.email).toBe('perfil1@metanolfc.com');
            expect(response.body.password_hash).toBeUndefined();
        });

        it('Cenário 2: Atualiza nome e apelido', async () => {
            const cookie = await registerAndLogin('perfil2@metanolfc.com');

            const response = await request(app.getHttpServer())
                .patch('/api/users/me')
                .set('Cookie', cookie)
                .send({ name: 'Novo Nome', nickname: 'NovoApelido2' });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Novo Nome');
            expect(response.body.nickname).toBe('NovoApelido2');
        });

        it('Cenário 3: Troca de senha invalida a senha antiga no login seguinte', async () => {
            const cookie = await registerAndLogin('perfil3@metanolfc.com', 'Usuário Teste', 'SenhaAntiga123!');

            const updateResponse = await request(app.getHttpServer())
                .patch('/api/users/me')
                .set('Cookie', cookie)
                .send({ password: 'SenhaNova456!' });
            expect(updateResponse.status).toBe(200);

            const oldPasswordLogin = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({ email: 'perfil3@metanolfc.com', password: 'SenhaAntiga123!' });
            expect(oldPasswordLogin.status).toBe(401);

            const newPasswordLogin = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({ email: 'perfil3@metanolfc.com', password: 'SenhaNova456!' });
            expect(newPasswordLogin.status).toBe(200);
        });
    });

    describe('Cenários de Falha (Caminho de Exceção)', () => {

        it('Cenário 4: Apelido já usado por outro usuário é rejeitado (409)', async () => {
            const cookieA = await registerAndLogin('perfil4a@metanolfc.com', 'Fulano', 'SenhaForte123!');
            await request(app.getHttpServer())
                .patch('/api/users/me')
                .set('Cookie', cookieA)
                .send({ nickname: 'ApelidoOcupado' });

            const cookieB = await registerAndLogin('perfil4b@metanolfc.com');
            const response = await request(app.getHttpServer())
                .patch('/api/users/me')
                .set('Cookie', cookieB)
                .send({ nickname: 'ApelidoOcupado' });

            expect(response.status).toBe(409);
        });

        it('Cenário 5: Requisição sem autenticação é rejeitada', async () => {
            const response = await request(app.getHttpServer()).get('/api/users/me');
            expect(response.status).toBe(401);
        });

        it('Cenário 6: Senha nova fora do padrão mínimo é rejeitada (400)', async () => {
            const cookie = await registerAndLogin('perfil6@metanolfc.com');

            const response = await request(app.getHttpServer())
                .patch('/api/users/me')
                .set('Cookie', cookie)
                .send({ password: '123' });

            expect(response.status).toBe(400);
        });
    });
})
