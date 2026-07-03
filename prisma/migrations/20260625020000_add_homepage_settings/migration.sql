CREATE TABLE `HomepageSettings` (
  `id` VARCHAR(191) NOT NULL DEFAULT 'main',
  `heroSlides` JSON NOT NULL,
  `aboutTitle` VARCHAR(191) NOT NULL DEFAULT 'AutoPro Showroom',
  `aboutText` TEXT NOT NULL,
  `categoryOrder` JSON NOT NULL,
  `featuredVehicleIds` JSON NOT NULL,
  `spotlightVehicleId` VARCHAR(191) NULL,
  `spotlightTitle` VARCHAR(191) NOT NULL DEFAULT 'Achetez avec confiance',
  `spotlightDescription` TEXT NOT NULL,
  `whyChooseUsTitle` VARCHAR(191) NOT NULL DEFAULT 'Pourquoi nous choisir ?',
  `whyChooseUsItems` JSON NOT NULL,
  `showReviews` BOOLEAN NOT NULL DEFAULT true,
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `HomepageSettings` (
  `id`,
  `heroSlides`,
  `aboutTitle`,
  `aboutText`,
  `categoryOrder`,
  `featuredVehicleIds`,
  `spotlightVehicleId`,
  `spotlightTitle`,
  `spotlightDescription`,
  `whyChooseUsTitle`,
  `whyChooseUsItems`,
  `showReviews`,
  `updatedAt`
) VALUES (
  'main',
  JSON_ARRAY(),
  'AutoPro Showroom',
  'Selectionnez les vehicules, les visuels et les textes de la page d''accueil depuis cette configuration.',
  JSON_ARRAY(),
  JSON_ARRAY(),
  NULL,
  'Achetez avec confiance',
  'Mettez en avant une voiture, un service ou une offre speciale directement depuis le backoffice.',
  'Pourquoi nous choisir ?',
  JSON_ARRAY(
    JSON_OBJECT('title', 'Offres de financement', 'text', 'Des solutions claires pour reserver ou acheter le vehicule adapte.'),
    JSON_OBJECT('title', 'Showroom verifie', 'text', 'Chaque annonce garde ses informations techniques et commerciales au meme endroit.'),
    JSON_OBJECT('title', 'Prix transparents', 'text', 'Prix, statut, kilometrage et disponibilite visibles des le premier contact.'),
    JSON_OBJECT('title', 'Service expert', 'text', 'Suivi commercial depuis le backoffice pour traiter les demandes rapidement.')
  ),
  true,
  NOW(3)
);
