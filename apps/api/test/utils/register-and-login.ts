import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { PrismaService } from "src/prisma/prisma.service";

/**
 * Cadastra e autentica um usuário de teste, retornando o cookie de sessão e
 * o id do usuário — usado por todas as specs e2e que precisam de um usuário
 * autenticado (RF02 em diante).
 */
export async function registerAndLogin(
  app: INestApplication,
  prisma: PrismaService,
  email: string,
  name = "Usuário Teste",
) {
  await request(app.getHttpServer())
    .post("/api/auth/register")
    .send({ name, email, password: "SenhaForte123!" });

  const response = await request(app.getHttpServer())
    .post("/api/auth/login")
    .send({ email, password: "SenhaForte123!" });

  const cookie = response.headers["set-cookie"][0];
  const user = await prisma.users.findUniqueOrThrow({ where: { email } });
  return { cookie, userId: user.id };
}
