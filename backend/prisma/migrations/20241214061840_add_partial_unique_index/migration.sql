-- DropIndex
DROP INDEX "address_user_id_is_default_key";

-- CreateIndex
CREATE INDEX "address_user_id_idx" ON "address"("user_id");

-- Add partial unique index for PostgreSQL
CREATE UNIQUE INDEX unique_user_default_address 
ON "address" ("user_id")
WHERE is_default = true;
