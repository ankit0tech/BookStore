/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `userinfo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "userinfo" ADD COLUMN     "googleId" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "userinfo_googleId_key" ON "userinfo"("googleId");
