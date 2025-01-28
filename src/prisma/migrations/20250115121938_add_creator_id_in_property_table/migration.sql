/*
  Warnings:

  - You are about to drop the column `landlordId` on the `property` table. All the data in the column will be lost.
  - Added the required column `creatorId` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Property` DROP FOREIGN KEY `Property_landlordId_fkey`;

-- DropIndex
DROP INDEX `Property_landlordId_fkey` ON `Property`;

-- AlterTable
ALTER TABLE `Property` DROP COLUMN `landlordId`,
    ADD COLUMN `creatorId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Property` ADD CONSTRAINT `Property_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
