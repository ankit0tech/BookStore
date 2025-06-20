/*
  Warnings:

  - You are about to drop the `purchase` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "orderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED');

-- CreateEnum
CREATE TYPE "paymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "deliveryMethod" AS ENUM ('STANDARD', 'EXPRESS', 'NEXT_DAY');

-- DropForeignKey
ALTER TABLE "purchase" DROP CONSTRAINT "purchase_address_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase" DROP CONSTRAINT "purchase_book_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase" DROP CONSTRAINT "purchase_offer_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase" DROP CONSTRAINT "purchase_user_id_fkey";

-- DropTable
DROP TABLE "purchase";

-- CreateTable
CREATE TABLE "order_item" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unit_price" INTEGER NOT NULL,
    "offer_id" INTEGER,
    "purchase_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "address_id" INTEGER NOT NULL,
    "order_number" TEXT NOT NULL,
    "order_status" "orderStatus" NOT NULL DEFAULT 'PENDING',
    "payment_status" "paymentStatus" NOT NULL DEFAULT 'PENDING',
    "delivery_charges" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "tax_amount" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "shipping_carrier" TEXT,
    "tracking_number" INTEGER,
    "delivery_method" "deliveryMethod" NOT NULL DEFAULT 'STANDARD',
    "expected_delivery_date" TIMESTAMP(3) NOT NULL,
    "actual_delivery_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_order_number_key" ON "order"("order_number");

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "special_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "userinfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
