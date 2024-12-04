-- Enums are implemented as ENUM types in MySQL
CREATE TABLE `User` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `username` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) UNIQUE NOT NULL,
    `address` TEXT,
    `profilePicture` VARCHAR(255),
    `isVerified` BOOLEAN DEFAULT FALSE,
    `isOnline` BOOLEAN DEFAULT FALSE,
    `lastOnlineAt` DATETIME,
    `lastLoginAt` DATETIME,
    `type` ENUM('STUDENT', 'LANDLORD') DEFAULT 'STUDENT',
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `Session` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `expiresAt` DATETIME,
    `ipAddress` VARCHAR(45),
    `deviceInfo` TEXT,
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
);

CREATE TABLE `Admin` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `AdminSession` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `expiresAt` DATETIME,
    `ipAddress` VARCHAR(45),
    `deviceInfo` TEXT,
    FOREIGN KEY (`userId`) REFERENCES `Admin`(`id`)
);

CREATE TABLE `Property` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `landlordId` INT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `address1` VARCHAR(255),
    `address2` VARCHAR(255),
    `city` VARCHAR(255),
    `postcode` VARCHAR(20),
    `longitude` FLOAT,
    `latitude` FLOAT,
    `propertyType` ENUM('APARTMENT', 'HOUSE', 'ROOM', 'STUDIO', 'SHARED_ROOM'),
    `floorNumber` INT,
    `totalFloors` INT,
    `yearBuilt` INT,
    `rent` DECIMAL(10,2),
    `additionalCosts` DECIMAL(10,2),
    `heatingIncludedInAdditionalCosts` BOOLEAN DEFAULT FALSE,
    `caution` DECIMAL(10,2),
    `livingSpaceSqm` FLOAT,
    `numberOfRooms` INT,
    `numberOfBeds` INT,
    `numberOfBaths` INT,
    `minimumLeaseTermInMonths` INT,
    `maximumLeaseTermInMonths` INT,
    `noticePeriodInMonths` INT,
    `availableFrom` DATETIME,
    `availableUntil` DATETIME,
    `liveFrom` DATETIME,
    `views` INT DEFAULT 0,
    `status` ENUM('DRAFT', 'PENDING', 'ACTIVE', 'RENTED', 'ARCHIVED', 'REJECTED'),
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`landlordId`) REFERENCES `User`(`id`)
);

CREATE TABLE `Amenity` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255),
    `description` TEXT,
    `icon` VARCHAR(255)
);

CREATE TABLE `PropertyAmenity` (
    `propertyId` INT,
    `amenityId` INT,
    PRIMARY KEY (`propertyId`, `amenityId`),
    FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`),
    FOREIGN KEY (`amenityId`) REFERENCES `Amenity`(`id`)
);

CREATE TABLE `PropertyMedia` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `propertyId` INT,
    `type` ENUM('IMAGE', 'VIDEO', 'DOCUMENT'),
    `url` VARCHAR(255),
    `name` VARCHAR(255),
    `thumbnail` VARCHAR(255),
    `description` TEXT,
    `status` ENUM('UPLOADING', 'ACTIVE', 'DELETED'),
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`)
);

CREATE TABLE `PropertyView` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `propertyId` INT,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `location` VARCHAR(255),
    `ipAddress` VARCHAR(45),
    `deviceInfo` TEXT,
    FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`)
);

CREATE TABLE `Appointment` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `studentId` INT,
    `landlordId` INT,
    `propertyId` INT,
    `notes` TEXT,
    `startTime` DATETIME,
    `endTime` DATETIME,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'),
    `cancellationReason` TEXT,
    `type` VARCHAR(50),
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`studentId`) REFERENCES `User`(`id`),
    FOREIGN KEY (`landlordId`) REFERENCES `User`(`id`),
    FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`)
);

CREATE TABLE `AppointmentReminder` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `appointmentId` INT,
    `time` DATETIME,
    FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`)
);

CREATE TABLE `Landmark` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `type` ENUM('EDUCATION', 'TRANSPORT', 'SHOPPING', 'SUPERMARKET', 'HEALTHCARE', 'FITNESS', 'ENTERTAINMENT', 'FOOD'),
    `address` TEXT,
    `longitude` FLOAT,
    `latitude` FLOAT,
    `openTime` DATETIME,
    `closeTime` DATETIME,
    `status` ENUM('PENDING', 'ACTIVE', 'REJECTED'),
    `googlePlaceId` VARCHAR(255)
);

CREATE TABLE `PropertyLandmark` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `propertyId` INT,
    `landmarkId` INT,
    `distanceMeters` INT,
    `durationWalk` INT,
    `durationDrive` INT,
    `durationTransit` INT,
    FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`),
    FOREIGN KEY (`landmarkId`) REFERENCES `Landmark`(`id`)
);

CREATE TABLE `Review` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `studentId` INT,
    `landlordId` INT,
    `propertyId` INT,
    `rating` INT,
    `comment` TEXT,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`studentId`) REFERENCES `User`(`id`),
    FOREIGN KEY (`landlordId`) REFERENCES `User`(`id`),
    FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`)
);

CREATE TABLE `Wishlist` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT,
    `propertyId` INT,
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`),
    FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`)
);

CREATE TABLE `Offer` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `studentId` INT,
    `landlordId` INT,
    `propertyId` INT,
    `notes` TEXT,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN'),
    `expiresAt` DATETIME,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`studentId`) REFERENCES `User`(`id`),
    FOREIGN KEY (`landlordId`) REFERENCES `User`(`id`),
    FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`)
);

CREATE TABLE `Chat` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `propertyId` INT,
    `lastMessageAt` DATETIME,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`)
);

CREATE TABLE `ChatParticipant` (
    `chatId` INT,
    `userId` INT,
    `status` ENUM('ACTIVE', 'BLOCKED'),
    PRIMARY KEY (`chatId`, `userId`),
    FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
);

CREATE TABLE `Message` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `chatId` INT,
    `userId` INT,
    `type` ENUM('TEXT', 'FILE', 'IMAGE', 'VIDEO'),
    `content` TEXT,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` DATETIME,
    `replyTo` INT,
    FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`),
    FOREIGN KEY (`replyTo`) REFERENCES `Message`(`id`)
);

CREATE TABLE `MessageState` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `messageId` INT,
    `userId` INT,
    `deliveredAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `readAt` DATETIME,
    FOREIGN KEY (`messageId`) REFERENCES `Message`(`id`),
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
);

CREATE TABLE `Template` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT,
    `content` TEXT,
    `shorthand` VARCHAR(255),
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
);

CREATE TABLE `SearchCriteria` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT,
    `query` JSON,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
);

CREATE TABLE `Notification` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT,
    `content` TEXT,
    `url` VARCHAR(255),
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `readAt` DATETIME,
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
);

CREATE TABLE `Follow` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `studentId` INT,
    `landlordId` INT,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`studentId`) REFERENCES `User`(`id`),
    FOREIGN KEY (`landlordId`) REFERENCES `User`(`id`)
);

CREATE TABLE `Report` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT,
    `propertyId` INT,
    `notes` TEXT,
    `status` ENUM('PENDING', 'RESOLVED'),
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`),
    FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`)
);
