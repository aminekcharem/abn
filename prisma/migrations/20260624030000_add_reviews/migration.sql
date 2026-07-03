CREATE TABLE `Review` (
  `id` VARCHAR(191) NOT NULL,
  `firstName` VARCHAR(191) NOT NULL,
  `lastName` VARCHAR(191) NOT NULL,
  `isAnonymous` BOOLEAN NOT NULL DEFAULT false,
  `rating` INTEGER NOT NULL,
  `message` TEXT NOT NULL,
  `isPublished` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `Review_isPublished_idx`(`isPublished`),
  INDEX `Review_rating_idx`(`rating`),
  INDEX `Review_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
