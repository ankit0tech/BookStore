-- AlterTable
ALTER TABLE "book" ADD COLUMN     "cancellation_hours" INTEGER NOT NULL DEFAULT 168,
ADD COLUMN     "cancellation_policy" TEXT,
ADD COLUMN     "is_cancellable" BOOLEAN NOT NULL DEFAULT true;
