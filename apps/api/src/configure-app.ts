import type { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import cookieParser from 'cookie-parser';

// Configuração compartilhada entre o bootstrap local (main.ts, app.listen
// tradicional) e o handler serverless da Vercel (api/index.ts) — os dois
// precisam do mesmo cookie parser, pipe de validação e prefixo de rota.
export function configureApp(app: INestApplication): INestApplication {
  app.use(cookieParser());
  app.useGlobalPipes(new ZodValidationPipe());
  app.setGlobalPrefix('api');
  return app;
}
