/*
  Warnings:

  - You are about to drop the column `tax_amount` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order" DROP COLUMN "tax_amount",
ADD COLUMN     "tax_percentage" INTEGER NOT NULL DEFAULT 18;
