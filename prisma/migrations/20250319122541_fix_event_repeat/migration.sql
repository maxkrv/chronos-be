/*
  Warnings:

  - A unique constraint covering the columns `[event_id]` on the table `event_repeat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "event_repeat_event_id_key" ON "event_repeat"("event_id");
