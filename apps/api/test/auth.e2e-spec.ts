import { INestApplication } from "@nestjs/common"
import request from 'supertest';
import { PrismaService } from "src/prisma/prisma.service";
import { createTestApp } from "./utils/create-test-app";
import { cleanDatabase } from "./utils/clean-database";

describe('(RF01): Cadastro de novos usuários', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        ({ app, prisma } = await createTestApp());
        await cleanDatabase(prisma);
    })

    afterAll(async () => {
        await app.close()
    })

    describe('Cenários de Sucesso (Caminho Feliz)', () => {

        it('Cenário 1: Cadastro realizado com sucesso apenas com dados obrigatórios', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                    name: 'Eduardo Lima',
                    email: 'eduardo.lima1@metanolfc.com',
                    password: 'SenhaSegura123!',
                });
            expect(response.status).toBe(201);
            expect(response.body.message).toBe(
                'Cadastro realizado com sucesso! Faça login para continuar.',
            );
        });

        it('Cenário 2: Cadastro preenchendo o campo opcional de apelido', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                    name: 'Eduardo Lima',
                    nickname: 'Dudu',
                    email: 'dudu@metanolfc.com',
                    password: 'SenhaForte987!',
                });
            expect(response.status).toBe(201);

        });
    });


    describe('Cenários de Falha (Caminho de Exceção)', () => {

        it('Cenário 3: Cadastro rejeitado por e-mail duplicado', async () => {

            await request(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                    name: 'Eduardo Lima',
                    email: 'kaua.lima@metanolfc.com',
                    password: 'SenhaForte987!',
            });

            const response = await request(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                    name: 'Eduardo Outro',
                    email: 'kaua.lima@metanolfc.com',
                    password: 'SenhaSecreta999!',
                });
            expect(response.status).toBe(409);
            expect(response.body.message).toBe('O e-mail informado já está em uso.');
        });

        it('Cenário 4: Cadastro rejeitado por senha fora dos padrões mínimos de segurança', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                    name: 'Eduardo Lima',
                    email: 'eduardo.novo@metanolfc.com',
                    password: '123',
                });
            expect(response.status).toBe(400); 
            expect(response.body.message).toBeDefined();
        });

        it('Cenário 5: Cadastro rejeitado por ausência de campos obrigatórios', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/register')
                .send({}); 
            expect(response.status).toBe(400);
            expect(response.body.message).toBeDefined();
        });
    });
})