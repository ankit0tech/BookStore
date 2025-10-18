/*
  Warnings:

  - You are about to alter the column `price` on the `book` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `unit_price` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `delivery_charges` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `subtotal` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `total_amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('INR', 'USD');

-- AlterTable
ALTER TABLE "public"."book" ADD COLUMN     "currency" "public"."Currency" NOT NULL DEFAULT 'INR',
ALTER COLUMN "price" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."order_items" ADD COLUMN     "currency" "public"."Currency" NOT NULL DEFAULT 'INR',
ALTER COLUMN "unit_price" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "currency" "public"."Currency" NOT NULL DEFAULT 'INR',
ALTER COLUMN "delivery_charges" SET DATA TYPE INTEGER,
ALTER COLUMN "subtotal" SET DATA TYPE INTEGER,
ALTER COLUMN "total_amount" SET DATA TYPE INTEGER;
