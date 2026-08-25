-- CreateEnum
CREATE TYPE "TeamSplitOutcome" AS ENUM ('team_win', 'draw');

-- AlterTable
ALTER TABLE "TeamSplit" ADD COLUMN     "outcome" "TeamSplitOutcome",
ADD COLUMN     "resultRecordedAt" TIMESTAMP(3),
ADD COLUMN     "resultRecordedBy" TEXT,
ADD COLUMN     "winningTeamIndex" INTEGER;

-- AddForeignKey
ALTER TABLE "TeamSplit" ADD CONSTRAINT "TeamSplit_resultRecordedBy_fkey" FOREIGN KEY ("resultRecordedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
