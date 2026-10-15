UPDATE `TranslationEntry`
SET `sourceText` = 'À propos ABN',
    `targetText` = 'About ABN',
    `updatedAt` = CURRENT_TIMESTAMP(3)
WHERE `sourceText` = 'À propos d''AutoPro';

INSERT IGNORE INTO `TranslationEntry`
  (`id`, `sourceText`, `targetText`, `isActive`, `createdAt`, `updatedAt`)
VALUES
  (UUID(), 'À propos ABN', 'About ABN', true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));
