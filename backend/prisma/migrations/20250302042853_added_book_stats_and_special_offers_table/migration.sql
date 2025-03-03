-- CreateTable
CREATE TABLE "book_stats" (
    "book_id" INTEGER NOT NULL,
    "purchase_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "book_stats_pkey" PRIMARY KEY ("book_id")
);

-- CreateTable
CREATE TABLE "special_offers" (
    "id" SERIAL NOT NULL,
    "discount_percentage" INTEGER NOT NULL,
    "offer_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "offer_valid_from" TIMESTAMP(3) NOT NULL,
    "offer_valid_until" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "special_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BookOnOffer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BookOnOffer_AB_unique" ON "_BookOnOffer"("A", "B");

-- CreateIndex
CREATE INDEX "_BookOnOffer_B_index" ON "_BookOnOffer"("B");

-- AddForeignKey
ALTER TABLE "book_stats" ADD CONSTRAINT "book_stats_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookOnOffer" ADD CONSTRAINT "_BookOnOffer_A_fkey" FOREIGN KEY ("A") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookOnOffer" ADD CONSTRAINT "_BookOnOffer_B_fkey" FOREIGN KEY ("B") REFERENCES "special_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
