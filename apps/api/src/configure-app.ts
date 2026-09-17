import { RequestMethod, type INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import cookieParser from 'cookie-parser';

// Configuração compartilhada entre o bootstrap local (main.ts, app.listen
// tradicional) e o handler serverless da Vercel (api/index.ts) — os dois
// precisam do mesmo cookie parser, pipe de validação e prefixo de rota.
export function configureApp(app: INestApplication): INestApplication {
  app.use(cookieParser());
  app.useGlobalPipes(new ZodValidationPipe());
  // /join/:inviteCode fica fora do prefixo /api porque é o link de convite
  // (https://.../join/CODIGO) que a pessoa abre direto no navegador — precisa
  // de uma URL "limpa", não de um endpoint de API.
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'join/:inviteCode', method: RequestMethod.GET }],
  });
  return app;
}
