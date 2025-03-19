/*
  Warnings:

  - You are about to alter the column `description` on the `event` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1000)`.

*/
-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('MINUTELY', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "event" ADD COLUMN     "link" VARCHAR(1000),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "color" SET DEFAULT '#9bb0c1',
ALTER COLUMN "end_at" DROP NOT NULL;

-- CreateTable
CREATE TABLE "event_repeat" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "repeat_time" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_repeat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event_repeat" ADD CONSTRAINT "event_repeat_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
