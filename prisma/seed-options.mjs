import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed option categories.");
}

const adapter = new PrismaMariaDb(
  databaseUrl.replace(/^mysql:\/\//, "mariadb://"),
);
const prisma = new PrismaClient({ adapter });

const optionCategories = [
  {
    name: "Confort",
    slug: "confort",
    options: [
      "Climatisation manuelle",
      "Climatisation automatique",
      "Climatisation bi-zone",
      "Climatisation tri-zone",
      "Sièges chauffants",
      "Sièges ventilés",
      "Sièges électriques",
      "Sièges à mémoire",
      "Volant chauffant",
      "Volant multifonction",
      "Accoudoir central",
      "Démarrage sans clé",
      "Ouverture sans clé",
      "Régulateur de vitesse",
      "Régulateur adaptatif",
      "Frein de stationnement électrique",
      "Vitres électriques avant",
      "Vitres électriques arrière",
    ],
  },
  {
    name: "Multimédia & Connectivité",
    slug: "multimedia-connectivite",
    options: [
      "Écran tactile",
      "GPS intégré",
      "Android Auto",
      "Apple CarPlay",
      "Bluetooth",
      "USB",
      "USB-C",
      "Chargeur sans fil",
      "Commandes vocales",
      "Système audio premium",
      "Radio numérique DAB",
      "Affichage tête haute (HUD)",
      "Wi-Fi embarqué",
    ],
  },
  {
    name: "Sécurité",
    slug: "securite",
    options: [
      "ABS",
      "ESP",
      "ASR (Antipatinage)",
      "Airbags frontaux",
      "Airbags latéraux",
      "Airbags rideaux",
      "Isofix",
      "Alarme",
      "Antidémarrage",
      "Détection de fatigue",
      "Aide au maintien de voie",
      "Surveillance angle mort",
      "Reconnaissance panneaux",
      "Freinage automatique d'urgence",
      "Assistance descente",
      "Assistance démarrage en côte",
    ],
  },
  {
    name: "Aide à la conduite",
    slug: "aide-conduite",
    options: [
      "Caméra de recul",
      "Caméra 360°",
      "Radar avant",
      "Radar arrière",
      "Stationnement automatique",
      "Régulateur adaptatif",
      "Limiteur de vitesse",
      "Détecteur de pluie",
      "Détecteur de luminosité",
      "Assistant embouteillage",
      "Vision nocturne",
    ],
  },
  {
    name: "Intérieur",
    slug: "interieur",
    options: [
      "Sellerie tissu",
      "Sellerie cuir",
      "Sellerie cuir Nappa",
      "Sièges sport",
      "Sièges massants",
      "Tableau de bord numérique",
      "Éclairage d'ambiance",
      "Toit panoramique",
      "Toit ouvrant",
      "Rideaux pare-soleil",
    ],
  },
  {
    name: "Extérieur",
    slug: "exterieur",
    options: [
      "Jantes alliage",
      "Jantes aluminium",
      'Jantes 17"',
      'Jantes 18"',
      'Jantes 19"',
      'Jantes 20"',
      "Feux LED",
      "Feux Matrix LED",
      "Feux Xenon",
      "Feux antibrouillard",
      "Vitres teintées",
      "Rétroviseurs électriques",
      "Rétroviseurs rabattables",
      "Barres de toit",
      "Attelage",
    ],
  },
  {
    name: "Motorisation & Performance",
    slug: "motorisation-performance",
    options: [
      "Boîte manuelle",
      "Boîte automatique",
      "Boîte séquentielle",
      "4 roues motrices",
      "Suspension sport",
      "Suspension pneumatique",
      "Suspension adaptative",
      "Mode Sport",
      "Start & Stop",
    ],
  },
  {
    name: "Électrique & Hybride",
    slug: "electrique-hybride",
    options: [
      "Recharge rapide DC",
      "Recharge AC",
      "Batterie longue autonomie",
      "Pompe à chaleur",
      "Câble de recharge inclus",
      "Récupération d'énergie",
      "Planification recharge",
    ],
  },
  {
    name: "Utilitaire",
    slug: "utilitaire",
    options: [
      "Porte latérale coulissante",
      "Double porte arrière",
      "Galerie de toit",
      "Attelage remorque",
      "Cloison cabine",
      "Hayon arrière",
      "Benne basculante",
    ],
  },
];

async function main() {
  for (const [index, category] of optionCategories.entries()) {
    const savedCategory = await prisma.optionCategory.upsert({
      where: { slug: category.slug },
      update: {
        isActive: true,
        name: category.name,
        order: index + 1,
      },
      create: {
        isActive: true,
        name: category.name,
        order: index + 1,
        slug: category.slug,
      },
    });

    for (const optionName of category.options) {
      await prisma.option.upsert({
        where: {
          name_categoryId: {
            categoryId: savedCategory.id,
            name: optionName,
          },
        },
        update: {},
        create: {
          categoryId: savedCategory.id,
          name: optionName,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
