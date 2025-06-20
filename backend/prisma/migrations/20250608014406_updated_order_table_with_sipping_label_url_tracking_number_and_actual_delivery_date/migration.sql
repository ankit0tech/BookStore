-- AlterTable
ALTER TABLE "order" ADD COLUMN     "shipping_label_url" TEXT,
ALTER COLUMN "tracking_number" SET DATA TYPE TEXT,
ALTER COLUMN "actual_delivery_date" DROP NOT NULL;
