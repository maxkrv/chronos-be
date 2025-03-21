/*
  Warnings:

  - You are about to drop the column `timezone` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[owner_id,name]` on the table `calendar` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "timezone",
ADD COLUMN     "country_code" VARCHAR(3);

-- CreateIndex
CREATE UNIQUE INDEX "calendar_owner_id_name_key" ON "calendar"("owner_id", "name");
