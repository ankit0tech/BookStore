/*
  Warnings:

  - Added the required column `name` to the `address` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "addressType" AS ENUM ('HOME', 'WORK', 'OTHER');

-- AlterTable
ALTER TABLE "address" ADD COLUMN     "address_type" "addressType" NOT NULL DEFAULT 'HOME',
ADD COLUMN     "name" VARCHAR(100),
ADD COLUMN     "phone_number" VARCHAR(20);

UPDATE "address" SET "name" = 'Address ' || id WHERE "name" IS NULL;

ALTER TABLE "address" ALTER COLUMN "name" SET NOT NULL;