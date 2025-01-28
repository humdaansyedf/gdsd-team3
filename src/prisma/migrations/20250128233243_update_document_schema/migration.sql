-- DropIndex
DROP INDEX `Document_url_key` ON `document`;

-- AlterTable
ALTER TABLE `document` MODIFY `url` TEXT NOT NULL;
