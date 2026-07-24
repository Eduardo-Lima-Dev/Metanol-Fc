import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(new ZodValidationPipe());
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3338);
  console.log(`🚀 API running on http://localhost:${process.env.PORT}/api`);
}

bootstrap();