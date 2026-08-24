-- CreateTable
CREATE TABLE "TeamSplit" (
    "id" TEXT NOT NULL,
    "rachaId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "params" JSONB NOT NULL,
    "teams" JSONB NOT NULL,

    CONSTRAINT "TeamSplit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamSplit_rachaId_createdAt_idx" ON "TeamSplit"("rachaId", "createdAt");

-- AddForeignKey
ALTER TABLE "TeamSplit" ADD CONSTRAINT "TeamSplit_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "Racha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSplit" ADD CONSTRAINT "TeamSplit_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
