-- DropIndex
DROP INDEX `Document_url_key` ON `document`;

-- AlterTable
ALTER TABLE `Document` MODIFY `url` TEXT NOT NULL;
