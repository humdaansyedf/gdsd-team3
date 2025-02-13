-- DropIndex
DROP INDEX `Document_url_key` ON `Document`;

-- AlterTable
ALTER TABLE `Document` MODIFY `url` TEXT NOT NULL;
