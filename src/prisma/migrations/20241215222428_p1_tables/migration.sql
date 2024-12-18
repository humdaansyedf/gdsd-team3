/*
  Warnings:

  - You are about to drop the column `petsAllowed` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `smokingAllowed` on the `Property` table. All the data in the column will be lost.
  - You are about to alter the column `totalRent` on the `Property` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Double`.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `coldRent` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `PropertyMedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `PropertyMedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `PropertyMedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_userId_fkey`;

-- AlterTable
ALTER TABLE `Property` DROP COLUMN `petsAllowed`,
    DROP COLUMN `smokingAllowed`,
    ADD COLUMN `additionalCosts` DOUBLE NULL,
    ADD COLUMN `address1` VARCHAR(191) NULL,
    ADD COLUMN `address2` VARCHAR(191) NULL,
    ADD COLUMN `balcony` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `cableTv` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `caution` DOUBLE NULL,
    ADD COLUMN `cellar` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `coldRent` DOUBLE NOT NULL,
    ADD COLUMN `elevator` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `floorNumber` INTEGER NULL,
    ADD COLUMN `furnished` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `garden` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `heatingIncludedInAdditionalCosts` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `internet` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `kitchen` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `livingSpaceSqm` DOUBLE NULL,
    ADD COLUMN `maximumLeaseTermInMonths` INTEGER NULL,
    ADD COLUMN `minimumLeaseTermInMonths` INTEGER NULL,
    ADD COLUMN `noticePeriodInMonths` INTEGER NULL,
    ADD COLUMN `numberOfBaths` INTEGER NULL,
    ADD COLUMN `numberOfBeds` INTEGER NULL,
    ADD COLUMN `parking` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `pets` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `propertyType` ENUM('APARTMENT', 'HOUSE', 'ROOM', 'STUDIO', 'SHARED_ROOM') NOT NULL DEFAULT 'APARTMENT',
    ADD COLUMN `smoking` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `totalFloors` INTEGER NULL,
    ADD COLUMN `washingMachine` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `yearBuilt` INTEGER NULL,
    MODIFY `postcode` VARCHAR(191) NULL,
    MODIFY `totalRent` DOUBLE NOT NULL,
    MODIFY `status` ENUM('DRAFT', 'PENDING', 'ACTIVE', 'RENTED', 'ARCHIVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `PropertyMedia` ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('PENDING', 'ACTIVE', 'REJECTED') NOT NULL,
    ADD COLUMN `thumbnail` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('IMAGE', 'VIDEO', 'DOCUMENT') NOT NULL;

-- AlterTable
ALTER TABLE `Session` DROP PRIMARY KEY,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deviceInfo` VARCHAR(191) NULL,
    ADD COLUMN `ipAddress` VARCHAR(191) NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `expiresAt` DATETIME(3) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `User` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `isOnline` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `lastLoginAt` DATETIME(3) NULL,
    ADD COLUMN `lastOnlineAt` DATETIME(3) NULL,
    ADD COLUMN `profilePicture` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `type` ENUM('STUDENT', 'LANDLORD') NOT NULL DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE `Chat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastMessageAt` DATETIME(3) NULL,
    `propertyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatParticipant` (
    `chatId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`chatId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `type` ENUM('TEXT', 'FILE', 'IMAGE', 'VIDEO') NOT NULL,
    `content` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `chatId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `deviceInfo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_phone_key` ON `User`(`phone`);

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatParticipant` ADD CONSTRAINT `ChatParticipant_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatParticipant` ADD CONSTRAINT `ChatParticipant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminSession` ADD CONSTRAINT `AdminSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
