import { PrismaService } from "src/prisma/prisma.service";

/**
 * Limpa todas as tabelas de domínio na ordem segura de FK. Com os testes e2e
 * rodando em série contra um único Postgres compartilhado (`maxWorkers: 1`
 * em jest-e2e.json), cada spec precisa começar de um estado limpo — inclusive
 * de dados deixados por specs anteriores — não só das próprias tabelas que
 * usa diretamente.
 */
export async function cleanDatabase(prisma: PrismaService) {
  await prisma.teamSplit.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.player.deleteMany();
  await prisma.rachaMember.deleteMany();
  await prisma.racha.deleteMany();
  await prisma.users.deleteMany();
}
