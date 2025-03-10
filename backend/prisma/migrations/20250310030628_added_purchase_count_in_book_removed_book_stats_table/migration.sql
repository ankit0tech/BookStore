/*
  Warnings:

  - You are about to drop the `book_stats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "book_stats" DROP CONSTRAINT "book_stats_book_id_fkey";

-- AlterTable
ALTER TABLE "book" ADD COLUMN     "purchase_count" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "book_stats";
