ALTER TABLE `ShowroomSettings`
  ADD COLUMN `contactPhone` VARCHAR(191) NOT NULL DEFAULT '+216 00 000 000',
  ADD COLUMN `contactEmail` VARCHAR(191) NOT NULL DEFAULT 'contact@autopro.test',
  ADD COLUMN `facebookUrl` VARCHAR(191) NULL,
  ADD COLUMN `instagramUrl` VARCHAR(191) NULL;
