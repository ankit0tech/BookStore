/*
  Warnings:

  - Added the required column `purchase_date` to the `cart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cart" ADD COLUMN     "purchase_date" TIMESTAMP(3) NOT NULL;
