/*
  Warnings:

  - You are about to drop the column `password` on the `Admin` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Admin` DROP COLUMN `password`,
    ADD COLUMN `passwordHash` VARCHAR(191) NOT NULL;
