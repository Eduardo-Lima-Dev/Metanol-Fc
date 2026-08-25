-- CreateTable
CREATE TABLE "TeamSplitPlayerStat" (
    "id" TEXT NOT NULL,
    "teamSplitId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "recordedBy" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamSplitPlayerStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamSplitPlayerStat_playerId_idx" ON "TeamSplitPlayerStat"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamSplitPlayerStat_teamSplitId_playerId_key" ON "TeamSplitPlayerStat"("teamSplitId", "playerId");

-- AddForeignKey
ALTER TABLE "TeamSplitPlayerStat" ADD CONSTRAINT "TeamSplitPlayerStat_teamSplitId_fkey" FOREIGN KEY ("teamSplitId") REFERENCES "TeamSplit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSplitPlayerStat" ADD CONSTRAINT "TeamSplitPlayerStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSplitPlayerStat" ADD CONSTRAINT "TeamSplitPlayerStat_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
