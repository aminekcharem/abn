-- CreateTable
CREATE TABLE `AdminUser` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `role` ENUM('ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'ADMIN',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `AdminUser_email_key`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `image` VARCHAR(191) NULL,
  `sort_order` INTEGER NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT true,

  UNIQUE INDEX `Category_slug_key`(`slug`),
  INDEX `Category_isActive_idx`(`isActive`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Brand` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `logo` VARCHAR(191) NULL,
  `countryOrigin` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,

  UNIQUE INDEX `Brand_slug_key`(`slug`),
  INDEX `Brand_isActive_idx`(`isActive`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Option` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `category` ENUM('SECURITE', 'CONFORT', 'TECHNOLOGIE', 'ESTHETIQUE') NOT NULL,

  UNIQUE INDEX `Option_name_category_key`(`name`, `category`),
  INDEX `Option_category_idx`(`category`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vehicle` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `brandId` VARCHAR(191) NOT NULL,
  `categoryId` VARCHAR(191) NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `year` INTEGER NOT NULL,
  `mileage` INTEGER NOT NULL,
  `power` INTEGER NOT NULL,
  `engine` VARCHAR(191) NOT NULL,
  `transmission` ENUM('MANUELLE', 'AUTOMATIQUE') NOT NULL,
  `fuelType` ENUM('ESSENCE', 'DIESEL', 'HYBRIDE', 'ELECTRIQUE') NOT NULL,
  `color` VARCHAR(191) NOT NULL,
  `doors` INTEGER NOT NULL,
  `seats` INTEGER NOT NULL,
  `status` ENUM('DISPONIBLE', 'VENDU', 'RESERVE') NOT NULL DEFAULT 'DISPONIBLE',
  `isFeatured` BOOLEAN NOT NULL DEFAULT false,
  `isNew` BOOLEAN NOT NULL DEFAULT false,
  `description` TEXT NULL,
  `images` JSON NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `Vehicle_slug_key`(`slug`),
  INDEX `Vehicle_brandId_idx`(`brandId`),
  INDEX `Vehicle_categoryId_idx`(`categoryId`),
  INDEX `Vehicle_status_idx`(`status`),
  INDEX `Vehicle_isFeatured_idx`(`isFeatured`),
  INDEX `Vehicle_isNew_idx`(`isNew`),
  INDEX `Vehicle_price_idx`(`price`),
  INDEX `Vehicle_year_idx`(`year`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactMessage` (
  `id` VARCHAR(191) NOT NULL,
  `fullName` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `subject` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `isRead` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `ContactMessage_isRead_idx`(`isRead`),
  INDEX `ContactMessage_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseRequest` (
  `id` VARCHAR(191) NOT NULL,
  `fullName` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `vehicleId` VARCHAR(191) NOT NULL,
  `message` TEXT NULL,
  `financing` BOOLEAN NOT NULL DEFAULT false,
  `status` ENUM('NOUVEAU', 'EN_COURS', 'TRAITE') NOT NULL DEFAULT 'NOUVEAU',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `PurchaseRequest_vehicleId_idx`(`vehicleId`),
  INDEX `PurchaseRequest_status_idx`(`status`),
  INDEX `PurchaseRequest_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_OptionToVehicle` (
  `A` VARCHAR(191) NOT NULL,
  `B` VARCHAR(191) NOT NULL,

  UNIQUE INDEX `_OptionToVehicle_AB_unique`(`A`, `B`),
  INDEX `_OptionToVehicle_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseRequest` ADD CONSTRAINT `PurchaseRequest_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OptionToVehicle` ADD CONSTRAINT `_OptionToVehicle_A_fkey` FOREIGN KEY (`A`) REFERENCES `Option`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OptionToVehicle` ADD CONSTRAINT `_OptionToVehicle_B_fkey` FOREIGN KEY (`B`) REFERENCES `Vehicle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
