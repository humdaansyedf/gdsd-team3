-- CreateTable
CREATE TABLE `Property` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `postcode` VARCHAR(191) NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `totalRent` DECIMAL(65, 30) NOT NULL,
    `numberOfRooms` INTEGER NOT NULL,
    `petsAllowed` BOOLEAN NOT NULL DEFAULT false,
    `smokingAllowed` BOOLEAN NOT NULL DEFAULT false,
    `availableFrom` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
