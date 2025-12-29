-- AlterTable
ALTER TABLE "public"."userinfo" ADD COLUMN     "deactivated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deactivated_at" TIMESTAMP(3),
ADD COLUMN     "verified_at" TIMESTAMP(3);
