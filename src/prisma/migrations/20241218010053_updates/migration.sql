/*
  Warnings:

  - You are about to drop the column `caution` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Property` DROP COLUMN `caution`,
    ADD COLUMN `deposit` DOUBLE NULL,
    ADD COLUMN `state` VARCHAR(191) NULL,
    MODIFY `yearBuilt` VARCHAR(191) NULL;
