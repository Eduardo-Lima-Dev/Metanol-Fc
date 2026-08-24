import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ZodValidationPipe } from 'nestjs-zod';
import cookieParser from 'cookie-parser';
import { ThrottlerStorage } from '@nestjs/throttler';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * Storage fake que nunca bloqueia: ThrottlerGuard consulta `increment()` a
 * cada requisição para decidir se bloqueia, então zerar `isBlocked` aqui
 * desativa o rate limiting sem precisar sobrescrever o guard global (que o
 * Nest resolve por um caminho de bootstrap que ignora `overrideProvider`
 * quando o token é `APP_GUARD`).
 */
class NoopThrottlerStorage implements ThrottlerStorage {
  increment() {
    return Promise.resolve({
      totalHits: 0,
      timeToExpire: 0,
      isBlocked: false,
      timeToBlockExpire: 0,
    });
  }
}

/**
 * Bootstrap padrão para specs e2e: replica a configuração de `main.ts` e
 * desativa o rate limiting global, já que os limites de taxa (RNF02) não são
 * o alvo dos testes funcionais e um único spec facilmente ultrapassa o limite
 * de `login`/`register` (5 req/60s) ao criar vários usuários de teste.
 */
export async function createTestApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ThrottlerStorage)
    .useClass(NoopThrottlerStorage)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(new ZodValidationPipe());
  app.setGlobalPrefix('api');
  await app.init();

  const prisma = app.get(PrismaService);

  return { app, prisma };
}
