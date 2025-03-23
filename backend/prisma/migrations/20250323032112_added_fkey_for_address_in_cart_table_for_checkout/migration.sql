-- AlterTable
ALTER TABLE "cart" ADD COLUMN     "address_id" INTEGER;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE CASCADE ON UPDATE CASCADE;
