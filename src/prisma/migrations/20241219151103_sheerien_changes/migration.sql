/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Chat` table. All the data in the column will be lost.
  - The primary key for the `ChatParticipant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `chatId` on the `ChatParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ChatParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `chatId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chatid,userid]` on the table `ChatParticipant` will be added. If there are existing duplicate values, this will fail.
  - Made the column `lastMessageAt` on table `Chat` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `chatid` to the `ChatParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userid` to the `ChatParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatid` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userid` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Made the column `content` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `ChatParticipant` DROP FOREIGN KEY `ChatParticipant_chatId_fkey`;

-- DropForeignKey
ALTER TABLE `ChatParticipant` DROP FOREIGN KEY `ChatParticipant_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_chatId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_userId_fkey`;

-- DropIndex
DROP INDEX `ChatParticipant_userId_fkey` ON `ChatParticipant`;

-- DropIndex
DROP INDEX `Message_chatId_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Message_userId_fkey` ON `Message`;

-- AlterTable
ALTER TABLE `Chat` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    MODIFY `lastMessageAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `ChatParticipant` DROP PRIMARY KEY,
    DROP COLUMN `chatId`,
    DROP COLUMN `userId`,
    ADD COLUMN `chatid` INTEGER NOT NULL,
    ADD COLUMN `userid` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Message` DROP COLUMN `chatId`,
    DROP COLUMN `deletedAt`,
    DROP COLUMN `type`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `userId`,
    ADD COLUMN `chatid` INTEGER NOT NULL,
    ADD COLUMN `userid` INTEGER NOT NULL,
    MODIFY `content` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ChatParticipant_chatid_userid_key` ON `ChatParticipant`(`chatid`, `userid`);

-- AddForeignKey
ALTER TABLE `ChatParticipant` ADD CONSTRAINT `ChatParticipant_chatid_fkey` FOREIGN KEY (`chatid`) REFERENCES `Chat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatParticipant` ADD CONSTRAINT `ChatParticipant_userid_fkey` FOREIGN KEY (`userid`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chatid_fkey` FOREIGN KEY (`chatid`) REFERENCES `Chat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_userid_fkey` FOREIGN KEY (`userid`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
