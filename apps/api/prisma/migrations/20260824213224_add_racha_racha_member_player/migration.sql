-- CreateEnum
CREATE TYPE "RachaMemberRole" AS ENUM ('admin', 'member');

-- CreateTable
CREATE TABLE "Racha" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schedule" TEXT,
    "evaluationsOpen" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Racha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RachaMember" (
    "id" TEXT NOT NULL,
    "rachaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "RachaMemberRole" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RachaMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "rachaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "manualAverage" DOUBLE PRECISION,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RachaMember_userId_idx" ON "RachaMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RachaMember_rachaId_userId_key" ON "RachaMember"("rachaId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_rachaId_userId_key" ON "Player"("rachaId", "userId");

-- AddForeignKey
ALTER TABLE "Racha" ADD CONSTRAINT "Racha_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RachaMember" ADD CONSTRAINT "RachaMember_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "Racha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RachaMember" ADD CONSTRAINT "RachaMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "Racha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
