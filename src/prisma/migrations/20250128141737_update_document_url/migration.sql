/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `url` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Document` ADD COLUMN `url` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Document_url_key` ON `Document`(`url`);
