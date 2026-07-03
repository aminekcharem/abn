ALTER TABLE `HomepageSettings`
  ADD COLUMN `showFaqs` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `faqItems` JSON NULL;

UPDATE `HomepageSettings`
SET `faqItems` = JSON_ARRAY(
  JSON_OBJECT(
    'question',
    'Est-ce que tous les vehicules affiches sont disponibles ?',
    'answer',
    'Les vehicules visibles sur le site sont synchronises avec le showroom. Notre equipe confirme la disponibilite avant chaque reservation ou achat.'
  ),
  JSON_OBJECT(
    'question',
    'Comment choisir le vehicule adapte a mon budget ?',
    'answer',
    'Vous pouvez comparer les prix, les options, le kilometrage et le statut directement depuis la page d''accueil, puis demander un accompagnement commercial.'
  ),
  JSON_OBJECT(
    'question',
    'Puis-je reserver une voiture avant de venir au showroom ?',
    'answer',
    'Oui, le formulaire de demande permet de signaler votre interet. Un conseiller vous recontacte pour valider les prochaines etapes.'
  ),
  JSON_OBJECT(
    'question',
    'Les informations techniques sont-elles verifiees ?',
    'answer',
    'Chaque annonce garde ses donnees principales dans le backoffice afin de presenter des informations claires et coherentes sur le site.'
  )
);

ALTER TABLE `HomepageSettings`
  MODIFY COLUMN `faqItems` JSON NOT NULL;
