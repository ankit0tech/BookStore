/*
  Warnings:

  - A unique constraint covering the columns `[isbn]` on the table `book` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sku]` on the table `book` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "book" ADD COLUMN     "description" TEXT,
ADD COLUMN     "format" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isbn" TEXT,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'English',
ADD COLUMN     "pages" INTEGER,
ADD COLUMN     "publisher" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shelf_location" TEXT,
ADD COLUMN     "sku" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "book_isbn_key" ON "book"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "book_sku_key" ON "book"("sku");
