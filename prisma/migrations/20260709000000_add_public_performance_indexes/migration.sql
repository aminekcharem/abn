CREATE INDEX `Category_isActive_sort_order_name_idx` ON `Category`(`isActive`, `sort_order`, `name`);

CREATE INDEX `Brand_isActive_name_idx` ON `Brand`(`isActive`, `name`);

CREATE INDEX `Vehicle_status_isFeatured_isNew_createdAt_idx` ON `Vehicle`(`status`, `isFeatured`, `isNew`, `createdAt`);

CREATE INDEX `Vehicle_categoryId_status_isFeatured_createdAt_idx` ON `Vehicle`(`categoryId`, `status`, `isFeatured`, `createdAt`);

CREATE INDEX `Vehicle_brandId_status_createdAt_idx` ON `Vehicle`(`brandId`, `status`, `createdAt`);
