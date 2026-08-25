import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import serverlessExpress from "@vendia/serverless-express";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
// Importa do dist (compilado por `nest build` no build da Vercel), não do
// src/ — decorators do NestJS precisam do metadata emitido pelo compilador
// do Nest (tsc), que o bundler da própria Vercel (esbuild) não reproduz
// corretamente.
import { AppModule } from "../dist/app.module";
import { configureApp } from "../dist/configure-app";

type ServerHandler = ReturnType<typeof serverlessExpress>;

let cachedHandler: ServerHandler | undefined;

async function bootstrap(): Promise<ServerHandler> {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  configureApp(app);
  await app.init();
  return serverlessExpress({ app: expressApp });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!cachedHandler) {
    cachedHandler = await bootstrap();
  }
  return cachedHandler(req, res);
}
