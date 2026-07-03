ALTER TABLE `Category`
  ADD COLUMN `showOnHomepage` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `showOnCategoriesPage` BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX `Category_showOnHomepage_idx` ON `Category`(`showOnHomepage`);
CREATE INDEX `Category_showOnCategoriesPage_idx` ON `Category`(`showOnCategoriesPage`);
