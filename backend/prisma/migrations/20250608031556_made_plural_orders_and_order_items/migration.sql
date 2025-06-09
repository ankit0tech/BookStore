/*
  Warnings:

  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_item` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_address_id_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_user_id_fkey";

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_book_id_fkey";

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_offer_id_fkey";

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_order_id_fkey";

-- DropTable
DROP TABLE "order";

-- DropTable
DROP TABLE "order_item";

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unit_price" INTEGER NOT NULL,
    "offer_id" INTEGER,
    "purchase_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "address_id" INTEGER NOT NULL,
    "order_number" TEXT NOT NULL,
    "order_status" "orderStatus" NOT NULL DEFAULT 'PENDING',
    "payment_status" "paymentStatus" NOT NULL DEFAULT 'PENDING',
    "delivery_charges" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "tax_percentage" INTEGER NOT NULL DEFAULT 18,
    "total_amount" INTEGER NOT NULL,
    "shipping_carrier" TEXT,
    "tracking_number" TEXT,
    "shipping_label_url" TEXT,
    "delivery_method" "deliveryMethod" NOT NULL DEFAULT 'STANDARD',
    "expected_delivery_date" TIMESTAMP(3) NOT NULL,
    "actual_delivery_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "special_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "userinfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
