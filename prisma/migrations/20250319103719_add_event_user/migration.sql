-- CreateTable
CREATE TABLE "event_user" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "calendar_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "event_user_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event_user" ADD CONSTRAINT "event_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_user" ADD CONSTRAINT "event_user_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
