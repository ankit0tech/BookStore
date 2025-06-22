-- CreateEnum
CREATE TYPE "cancellationStatus" AS ENUM ('NONE', 'REQUESTED', 'REJECTED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "orderStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "cancellation_reason" TEXT,
ADD COLUMN     "cancellation_requested_at" TIMESTAMP(3),
ADD COLUMN     "cancellation_resolved_at" TIMESTAMP(3),
ADD COLUMN     "cancellation_status" "cancellationStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "cancelled_by" INTEGER;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "userinfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
