/*
  Warnings:

  - You are about to drop the column `address_id` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the column `purchase_date` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the column `purchased` on the `cart` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "cart" DROP CONSTRAINT "cart_address_id_fkey";

-- DropForeignKey
ALTER TABLE "cart" DROP CONSTRAINT "cart_offer_id_fkey";

-- AlterTable
ALTER TABLE "cart" DROP COLUMN "address_id",
DROP COLUMN "purchase_date",
DROP COLUMN "purchased";

-- CreateTable
CREATE TABLE "purchase" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "purchase_price" INTEGER NOT NULL,
    "offer_id" INTEGER,
    "address_id" INTEGER NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "special_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "userinfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "special_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
