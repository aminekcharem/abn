CREATE TABLE `ShowroomSettings` (
  `id` VARCHAR(191) NOT NULL DEFAULT 'main',
  `companyName` VARCHAR(191) NOT NULL DEFAULT 'AutoPro Showroom',
  `logoUrl` VARCHAR(191) NULL,
  `logoWidth` INTEGER NOT NULL DEFAULT 160,
  `logoHeight` INTEGER NOT NULL DEFAULT 48,
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `ShowroomSettings` (
  `id`,
  `companyName`,
  `logoWidth`,
  `logoHeight`,
  `updatedAt`
) VALUES (
  'main',
  'AutoPro Showroom',
  160,
  48,
  CURRENT_TIMESTAMP(3)
);
