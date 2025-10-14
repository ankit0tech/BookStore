/*
  Warnings:

  - You are about to drop the column `tax_percentage` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."_BookOnOffer" ADD CONSTRAINT "_BookOnOffer_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_BookOnOffer_AB_unique";

-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "tax_percentage";
