-- AlterTable: adiciona a coluna como opcional primeiro
ALTER TABLE "Racha" ADD COLUMN "inviteCode" TEXT;

-- Backfill: gera um código único pra cada racha já existente
UPDATE "Racha" SET "inviteCode" = gen_random_uuid()::text WHERE "inviteCode" IS NULL;

-- Agora torna a coluna obrigatória e única
ALTER TABLE "Racha" ALTER COLUMN "inviteCode" SET NOT NULL;
CREATE UNIQUE INDEX "Racha_inviteCode_key" ON "Racha"("inviteCode");
