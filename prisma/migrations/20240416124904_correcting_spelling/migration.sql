/*
  Warnings:

  - You are about to drop the column `timeToFnish` on the `Exam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Exam` DROP COLUMN `timeToFnish`,
    ADD COLUMN `timeToFinish` INTEGER NULL DEFAULT 300000;
