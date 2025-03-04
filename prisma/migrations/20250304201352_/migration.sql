/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarUrl",
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false;
