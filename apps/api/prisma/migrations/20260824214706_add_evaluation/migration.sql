-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "rachaId" TEXT NOT NULL,
    "evaluatedPlayerId" TEXT NOT NULL,
    "evaluatorPlayerId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_rachaId_evaluatedPlayerId_evaluatorPlayerId_key" ON "Evaluation"("rachaId", "evaluatedPlayerId", "evaluatorPlayerId");

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "Racha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_evaluatedPlayerId_fkey" FOREIGN KEY ("evaluatedPlayerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_evaluatorPlayerId_fkey" FOREIGN KEY ("evaluatorPlayerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
