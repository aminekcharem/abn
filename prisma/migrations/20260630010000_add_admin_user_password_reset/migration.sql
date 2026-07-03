ALTER TABLE `AdminUser`
ADD COLUMN `resetTokenHash` VARCHAR(191) NULL,
ADD COLUMN `resetTokenExpiresAt` DATETIME(3) NULL,
ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

CREATE UNIQUE INDEX `AdminUser_resetTokenHash_key` ON `AdminUser`(`resetTokenHash`);
