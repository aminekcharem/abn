import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import { pbkdf2Sync, randomBytes } from "node:crypto";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaMariaDb(
  databaseUrl.replace(/^mysql:\/\//, "mariadb://"),
);
const prisma = new PrismaClient({ adapter });

function hashPassword(password) {
  const iterations = 310000;
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256").toString(
    "hex",
  );

  return `pbkdf2_sha256$${iterations}$${salt}$${hash}`;
}

async function main() {
  await prisma.showroomSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      companyName: "AutoPro Showroom",
      logoWidth: 160,
      logoHeight: 48,
    },
  });

  await prisma.adminUser.upsert({
    where: { email: "admin@autopro.local" },
    update: {
      name: "Super Admin AutoPro",
      role: "SUPER_ADMIN",
      password: hashPassword("Admin@1234"),
    },
    create: {
      email: "admin@autopro.local",
      password: hashPassword("Admin@1234"),
      name: "Super Admin AutoPro",
      role: "SUPER_ADMIN",
    },
  });

  const categoryDefinitions = [
    ["Citadine", "citadine", "car"],
    ["Berline", "berline", "car"],
    ["Compacte", "compacte", "car-front"],
    ["Break", "break", "wagon"],
    ["Coupé", "coupe", "gauge"],
    ["Cabriolet", "cabriolet", "sparkles"],
    ["Roadster", "roadster", "gauge"],
    ["Monospace", "monospace", "users"],
    ["SUV", "suv", "suv"],
    ["Crossover", "crossover", "car-front"],
    ["4x4 / Tout-terrain", "4x4-tout-terrain", "mountain"],
    ["Pick-up", "pick-up", "truck"],
    ["Limousine", "limousine", "badge-check"],
  ];

  const categories = await Promise.all(
    categoryDefinitions.map(([name, slug, icon], index) =>
      prisma.category.upsert({
        where: { slug },
        update: {
          description: `Categorie vehicule ${name}.`,
          icon,
          name,
          order: index + 1,
          isActive: true,
        },
        create: {
          name,
          slug,
          description: `Categorie vehicule ${name}.`,
          icon,
          image: `/categories/${slug}.jpg`,
          order: index + 1,
        },
      }),
    ),
  );

  const brandDefinitions = [
    ["Toyota", "toyota", "Japon"],
    ["Volkswagen", "volkswagen", "Allemagne"],
    ["Ford", "ford", "Etats-Unis"],
    ["Honda", "honda", "Japon"],
    ["Chevrolet", "chevrolet", "Etats-Unis"],
    ["Nissan", "nissan", "Japon"],
    ["Hyundai", "hyundai", "Coree du Sud"],
    ["Kia", "kia", "Coree du Sud"],
    ["Mercedes-Benz", "mercedes-benz", "Allemagne"],
    ["BMW", "bmw", "Allemagne"],
    ["Audi", "audi", "Allemagne"],
    ["Tesla", "tesla", "Etats-Unis"],
    ["Renault", "renault", "France"],
    ["Peugeot", "peugeot", "France"],
    ["Fiat", "fiat", "Italie"],
    ["Jeep", "jeep", "Etats-Unis"],
    ["Porsche", "porsche", "Allemagne"],
    ["Lexus", "lexus", "Japon"],
    ["Volvo", "volvo", "Suede"],
    ["Genesis", "genesis", "Coree du Sud"],
  ];

  const brands = await Promise.all(
    brandDefinitions.map(([name, slug, countryOrigin]) =>
      prisma.brand.upsert({
        where: { slug },
        update: {
          countryOrigin,
          isActive: true,
          name,
        },
        create: {
          countryOrigin,
          isActive: true,
          logo: `/brands/${slug}.svg`,
          name,
          slug,
        },
      }),
    ),
  );

  const confortOptionCategory = await prisma.optionCategory.upsert({
    where: { slug: "confort" },
    update: { isActive: true, name: "Confort", order: 1 },
    create: { isActive: true, name: "Confort", order: 1, slug: "confort" },
  });
  const securiteOptionCategory = await prisma.optionCategory.upsert({
    where: { slug: "securite" },
    update: { isActive: true, name: "Securite", order: 3 },
    create: { isActive: true, name: "Securite", order: 3, slug: "securite" },
  });
  const multimediaOptionCategory = await prisma.optionCategory.upsert({
    where: { slug: "multimedia-connectivite" },
    update: {
      isActive: true,
      name: "Multimedia & Connectivite",
      order: 2,
    },
    create: {
      isActive: true,
      name: "Multimedia & Connectivite",
      order: 2,
      slug: "multimedia-connectivite",
    },
  });
  const exterieurOptionCategory = await prisma.optionCategory.upsert({
    where: { slug: "exterieur" },
    update: { isActive: true, name: "Exterieur", order: 6 },
    create: { isActive: true, name: "Exterieur", order: 6, slug: "exterieur" },
  });

  const optionDefinitions = [
    ["Regulateur adaptatif", securiteOptionCategory.id],
    ["Sieges chauffants", confortOptionCategory.id],
    ["Ecran panoramique", multimediaOptionCategory.id],
    ["Pack carbone", exterieurOptionCategory.id],
  ];

  const options = await Promise.all(
    optionDefinitions.map(([name, categoryId]) =>
      prisma.option.upsert({
        where: {
          name_categoryId: {
            categoryId,
            name,
          },
        },
        update: {},
        create: {
          categoryId,
          name,
        },
      }),
    ),
  );

  const suv = categories.find((category) => category.slug === "suv");
  const berline = categories.find((category) => category.slug === "berline");
  const coupe = categories.find((category) => category.slug === "coupe");

  if (!suv || !berline || !coupe) {
    throw new Error("Seed categories are missing.");
  }
  const bmw = brands.find((brand) => brand.slug === "bmw");
  const mercedes = brands.find((brand) => brand.slug === "mercedes-benz");
  const genesis = brands.find((brand) => brand.slug === "genesis");

  if (!bmw || !mercedes || !genesis) {
    throw new Error("Seed brands are missing.");
  }
  const [adaptiveCruise, heatedSeats, panoramicScreen, carbonPack] = options;

  const g80 = await prisma.vehicle.upsert({
    where: { slug: "genesis-g80-electrified-2025" },
    update: {},
    create: {
      title: "Genesis G80 Electrified 2025",
      slug: "genesis-g80-electrified-2025",
      brandId: genesis.id,
      categoryId: berline.id,
      price: "78000000.00",
      year: 2025,
      mileage: 11240,
      power: 370,
      engine: "Dual Motor EV",
      transmission: "AUTOMATIQUE",
      fuelType: "ELECTRIQUE",
      color: "Noir anthracite",
      doors: 4,
      seats: 5,
      status: "DISPONIBLE",
      isFeatured: true,
      isNew: true,
      description:
        "Berline electrique premium avec finition executive et autonomie confortable.",
      images: [
        "/vehicles/genesis-g80-1.jpg",
        "/vehicles/genesis-g80-2.jpg",
      ],
      options: {
        connect: [
          { id: adaptiveCruise.id },
          { id: heatedSeats.id },
          { id: panoramicScreen.id },
        ],
      },
    },
  });

  await prisma.vehicle.upsert({
    where: { slug: "bmw-x5-xdrive40i-2024" },
    update: {},
    create: {
      title: "BMW X5 xDrive40i 2024",
      slug: "bmw-x5-xdrive40i-2024",
      brandId: bmw.id,
      categoryId: suv.id,
      price: "96000000.00",
      year: 2024,
      mileage: 8900,
      power: 381,
      engine: "3.0 TwinPower Turbo",
      transmission: "AUTOMATIQUE",
      fuelType: "ESSENCE",
      color: "Blanc mineral",
      doors: 5,
      seats: 5,
      status: "RESERVE",
      isFeatured: true,
      isNew: false,
      description:
        "SUV premium avec pack M Sport, suspension pneumatique et interieur cuir.",
      images: ["/vehicles/bmw-x5-1.jpg", "/vehicles/bmw-x5-2.jpg"],
      options: {
        connect: [
          { id: adaptiveCruise.id },
          { id: heatedSeats.id },
          { id: carbonPack.id },
        ],
      },
    },
  });

  await prisma.vehicle.upsert({
    where: { slug: "mercedes-eqe-350-amg-line-2025" },
    update: {},
    create: {
      title: "Mercedes-Benz EQE 350 AMG Line 2025",
      slug: "mercedes-eqe-350-amg-line-2025",
      brandId: mercedes.id,
      categoryId: coupe.id,
      price: "91000000.00",
      year: 2025,
      mileage: 5430,
      power: 292,
      engine: "Moteur electrique EQ",
      transmission: "AUTOMATIQUE",
      fuelType: "ELECTRIQUE",
      color: "Gris graphite",
      doors: 4,
      seats: 5,
      status: "DISPONIBLE",
      isFeatured: false,
      isNew: true,
      description:
        "EQE AMG Line avec technologies d'aide a la conduite et cockpit digital.",
      images: ["/vehicles/mercedes-eqe-1.jpg"],
      options: {
        connect: [
          { id: adaptiveCruise.id },
          { id: panoramicScreen.id },
        ],
      },
    },
  });

  await prisma.contactMessage.create({
    data: {
      fullName: "Min-Jun Park",
      email: "minjun@example.com",
      phone: "+82 10 1234 5678",
      subject: "Demande de visite showroom",
      message: "Je souhaite visiter le showroom cette semaine.",
    },
  });

  await prisma.purchaseRequest.create({
    data: {
      fullName: "Sarah Kim",
      email: "sarah.kim@example.com",
      phone: "+82 10 9876 5432",
      vehicleId: g80.id,
      message: "Je suis interessee par une offre avec reprise.",
      financing: true,
      status: "NOUVEAU",
    },
  });
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
