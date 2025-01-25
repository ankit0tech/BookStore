/*
  Warnings:

  - A unique constraint covering the columns `[user_id,book_id]` on the table `recently_viewed` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,book_id]` on the table `wishlist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `recently_viewed` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "recently_viewed" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "recently_viewed_user_id_book_id_key" ON "recently_viewed"("user_id", "book_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_user_id_book_id_key" ON "wishlist"("user_id", "book_id");

-- AddForeignKey
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "userinfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
