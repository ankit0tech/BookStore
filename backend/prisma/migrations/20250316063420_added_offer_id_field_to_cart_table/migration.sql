-- AlterTable
ALTER TABLE "cart" ADD COLUMN     "offer_id" INTEGER;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "special_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
