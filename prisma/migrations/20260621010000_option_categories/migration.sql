CREATE TABLE `OptionCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `iconSvg` TEXT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OptionCategory_slug_key`(`slug`),
    INDEX `OptionCategory_isActive_idx`(`isActive`),
    INDEX `OptionCategory_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `OptionCategory` (`id`, `name`, `slug`, `iconSvg`, `sort_order`, `isActive`, `createdAt`, `updatedAt`) VALUES
('option-category-confort', 'Confort', 'confort', NULL, 1, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('option-category-multimedia-connectivite', 'Multimedia & Connectivite', 'multimedia-connectivite', NULL, 2, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('option-category-securite', 'Securite', 'securite', NULL, 3, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('option-category-aide-conduite', 'Aide a la conduite', 'aide-conduite', NULL, 4, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('option-category-interieur', 'Interieur', 'interieur', NULL, 5, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('option-category-exterieur', 'Exterieur', 'exterieur', NULL, 6, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('option-category-motorisation-performance', 'Motorisation & Performance', 'motorisation-performance', NULL, 7, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('option-category-electrique-hybride', 'Electrique & Hybride', 'electrique-hybride', NULL, 8, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('option-category-utilitaire', 'Utilitaire', 'utilitaire', NULL, 9, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));

ALTER TABLE `Option` ADD COLUMN `categoryId` VARCHAR(191) NULL;

UPDATE `Option` SET `categoryId` = 'option-category-confort' WHERE `category` = 'CONFORT';
UPDATE `Option` SET `categoryId` = 'option-category-securite' WHERE `category` = 'SECURITE';
UPDATE `Option` SET `categoryId` = 'option-category-multimedia-connectivite' WHERE `category` = 'TECHNOLOGIE';
UPDATE `Option` SET `categoryId` = 'option-category-exterieur' WHERE `category` = 'ESTHETIQUE';

ALTER TABLE `Option` MODIFY `categoryId` VARCHAR(191) NOT NULL;
ALTER TABLE `Option` DROP INDEX `Option_name_category_key`;
ALTER TABLE `Option` DROP INDEX `Option_category_idx`;
ALTER TABLE `Option` DROP COLUMN `category`;
CREATE UNIQUE INDEX `Option_name_categoryId_key` ON `Option`(`name`, `categoryId`);
CREATE INDEX `Option_categoryId_idx` ON `Option`(`categoryId`);
ALTER TABLE `Option` ADD CONSTRAINT `Option_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `OptionCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
