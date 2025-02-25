/*
  Warnings:

  - You are about to alter the column `average_rating` on the `book` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(3,2)`.

*/
-- AlterTable
ALTER TABLE "book" ALTER COLUMN "average_rating" SET DEFAULT 0,
ALTER COLUMN "average_rating" SET DATA TYPE DECIMAL(3,2);
