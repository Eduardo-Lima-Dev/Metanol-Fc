import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ZodValidationPipe } from 'nestjs-zod';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';


describe('(RF01): Cadastro de novos usuários', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ZodValidationPipe());
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

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
      await request(app.getHttpServer()).post('/api/auth/register').send({
        name: 'Kauã',
        nickname: 'KK',
        email: 'kaua.lima@metanolfc.com',
        password: 'SenhaForte987!',
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Kauã Outro',
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
});

describe('(RF01): Autenticação de usuários (Login)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const VALID_USER = {
    name: 'Eduardo Lima',
    email: 'auth.login@metanolfc.com',
    password: 'SenhaSegura123!',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ZodValidationPipe());
    app.setGlobalPrefix('api');
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.user.deleteMany({ where: { email: VALID_USER.email } });
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(VALID_USER);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: VALID_USER.email } });
    await app.close();
  });

  describe('Cenários de Sucesso (Caminho Feliz)', () => {
    it('Cenário 1: Login realizado com sucesso — retorna 200 e define cookie httpOnly', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: VALID_USER.email, password: VALID_USER.password });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(VALID_USER.email);

      const raw = response.headers['set-cookie'];
      const setCookie: string[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
      const tokenCookie = setCookie.find((c: string) => c.startsWith('token='));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toMatch(/HttpOnly/i);
    });
  });

  describe('Cenários de Falha (Caminho de Exceção)', () => {
    it('Cenário 2: Login rejeitado por senha incorreta', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: VALID_USER.email, password: 'SenhaErrada000!' });
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Email ou senha invalidos');
    });
    it('Cenário 3: Login rejeitado por e-mail não cadastrado', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nao.existe@metanolfc.com',
          password: VALID_USER.password,
        });
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Email ou senha invalidos');
    });
    it('Cenário 4: Login rejeitado por ausência de campos obrigatórios', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
    it('Cenário 5: Login rejeitado por e-mail em formato inválido', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nao-e-um-email', password: VALID_USER.password });
      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });
});

describe('(RF01-REG): Regressão — nickname duplicado retorna 409', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(APP_GUARD)
      .useValue({ canActivate: () => true })
      .compile();
    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ZodValidationPipe());
    app.setGlobalPrefix('api');
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.user.deleteMany({ where: { nickname: 'NickUnico' } });
    // Cadastra o primeiro usuário com o nickname
    await request(app.getHttpServer()).post('/api/auth/register').send({
      name: 'Primeiro',
      nickname: 'NickUnico',
      email: 'nick1@metanolfc.com',
      password: 'SenhaForte123!',
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { nickname: 'NickUnico' } });
    await prisma.user.deleteMany({ where: { email: 'nick2@metanolfc.com' } });
    await app.close();
  });

  it('Cadastro com nickname já existente deve retornar 409 e não 500', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Segundo',
        nickname: 'NickUnico',
        email: 'nick2@metanolfc.com',
        password: 'SenhaForte456!',
      });
    expect(response.status).toBe(409);
    expect(response.body.message).toBe('O nickname informado já está em uso.');
  });
});
