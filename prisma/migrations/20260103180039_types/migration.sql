/*
  Warnings:

  - Added the required column `is_post` to the `articles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `articles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "is_post" BOOLEAN NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
