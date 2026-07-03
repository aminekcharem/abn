ALTER TABLE `Vehicle`
  MODIFY `priceCurrency` ENUM('MAD', 'TND', 'EUR') NOT NULL DEFAULT 'TND';

UPDATE `Vehicle`
  SET `priceCurrency` = 'TND'
  WHERE `priceCurrency` = 'MAD';

ALTER TABLE `Vehicle`
  MODIFY `priceCurrency` ENUM('TND', 'EUR') NOT NULL DEFAULT 'TND';
