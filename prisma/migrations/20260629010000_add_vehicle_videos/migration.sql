ALTER TABLE `Vehicle` ADD COLUMN `videos` JSON NULL;

UPDATE `Vehicle` SET `videos` = JSON_ARRAY() WHERE `videos` IS NULL;

ALTER TABLE `Vehicle` MODIFY `videos` JSON NOT NULL;
