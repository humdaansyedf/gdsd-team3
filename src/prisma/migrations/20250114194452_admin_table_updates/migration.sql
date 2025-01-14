/*
  Warnings:

  - You are about to drop the column `userId` on the `AdminSession` table. All the data in the column will be lost.
  - You are about to drop the `DummyTable` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `adminId` to the `AdminSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `AdminSession` DROP FOREIGN KEY `AdminSession_userId_fkey`;

-- DropIndex
DROP INDEX `AdminSession_userId_fkey` ON `AdminSession`;

-- AlterTable
ALTER TABLE `AdminSession` DROP COLUMN `userId`,
    ADD COLUMN `adminId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `DummyTable`;

-- AddForeignKey
ALTER TABLE `AdminSession` ADD CONSTRAINT `AdminSession_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
