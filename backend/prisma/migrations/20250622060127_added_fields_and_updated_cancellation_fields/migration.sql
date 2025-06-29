/*
  Warnings:

  - The values [CANCELLED] on the enum `cancellationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `cancelled_by` on the `orders` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "returnStatus" AS ENUM ('NONE', 'REQUESTED', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "cancellationStatus_new" AS ENUM ('NONE', 'REQUESTED', 'APPROVED', 'REJECTED');
ALTER TABLE "orders" ALTER COLUMN "cancellation_status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "cancellation_status" TYPE "cancellationStatus_new" USING ("cancellation_status"::text::"cancellationStatus_new");
ALTER TYPE "cancellationStatus" RENAME TO "cancellationStatus_old";
ALTER TYPE "cancellationStatus_new" RENAME TO "cancellationStatus";
DROP TYPE "cancellationStatus_old";
ALTER TABLE "orders" ALTER COLUMN "cancellation_status" SET DEFAULT 'NONE';
COMMIT;

-- AlterEnum
ALTER TYPE "orderStatus" ADD VALUE 'RETURNED';

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_cancelled_by_fkey";

-- AlterTable
ALTER TABLE "book" ADD COLUMN     "is_returnable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "return_days" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "return_policy" TEXT,
ALTER COLUMN "cancellation_hours" SET DEFAULT 24;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "cancelled_by",
ADD COLUMN     "cancellation_processed_by" INTEGER,
ADD COLUMN     "return_completed_at" TIMESTAMP(3),
ADD COLUMN     "return_processed_by" INTEGER,
ADD COLUMN     "return_reason" TEXT,
ADD COLUMN     "return_requested_at" TIMESTAMP(3),
ADD COLUMN     "return_resolved_at" TIMESTAMP(3),
ADD COLUMN     "return_shipping_label_url" TEXT,
ADD COLUMN     "return_status" "returnStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "return_tracking_number" TEXT;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_cancellation_processed_by_fkey" FOREIGN KEY ("cancellation_processed_by") REFERENCES "userinfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_return_processed_by_fkey" FOREIGN KEY ("return_processed_by") REFERENCES "userinfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
