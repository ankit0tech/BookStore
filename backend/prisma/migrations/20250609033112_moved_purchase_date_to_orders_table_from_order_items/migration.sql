/*
  Warnings:

  - You are about to drop the column `purchase_date` on the `order_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "purchase_date";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "purchase_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
