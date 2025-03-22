/*
  Warnings:

  - Added the required column `house_number` to the `address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "address" ADD COLUMN     "house_number" VARCHAR(255) NOT NULL DEFAULT 101;
