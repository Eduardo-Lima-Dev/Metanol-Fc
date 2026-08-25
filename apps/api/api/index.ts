import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express, { type Express } from "express";
// Importa do dist (compilado por `nest build` no build da Vercel), não do
// src/ — decorators do NestJS precisam do metadata emitido pelo compilador
// do Nest (tsc), que o bundler da própria Vercel (esbuild) não reproduz
// corretamente.
import { AppModule } from "../dist/app.module";
import { configureApp } from "../dist/configure-app";

let cachedApp: Express | undefined;

// A Vercel entrega req/res no formato padrão do Node/Express pro handler —
// não o evento cru do API Gateway da AWS Lambda. Um app Express (que é o que
// o ExpressAdapter do Nest usa por baixo) já é diretamente chamável como
// handler (req, res), então não precisa de nenhuma camada de adaptação
// (ex.: serverless-express, feito pra outro formato de evento).
async function bootstrap(): Promise<Express> {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  configureApp(app);
  await app.init();
  return expressApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  cachedApp(req, res);
}
