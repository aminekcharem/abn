import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import {
  ArrowUpRight,
  BadgeCheck,
  Car,
  CarFront,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Gauge,
  Heart,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { HeroCarousel, type HeroCarouselVehicle } from "./_components/hero-carousel";
import { HomeFaqAccordion } from "./_components/home-faq-accordion";
import { PublicHeader } from "./_components/public-header";
import { getMediaUrl } from "@/lib/cdn";
import { getHomepageSettings } from "@/lib/homepage-settings";
import { getPrisma } from "@/lib/prisma";
import { getShowroomSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

type HomeCategory = {
  description: string | null;
  icon: string | null;
  id: string;
  image: string | null;
  name: string;
  slug: string;
};

type HomeBrand = {
  id: string;
  logo: string | null;
  name: string;
  slug: string;
};

type HomeVehicle = {
  brand: { name: string };
  category: { name: string; slug: string };
  fuelType: "ESSENCE" | "DIESEL" | "HYBRIDE" | "ELECTRIQUE" | null;
  id: string;
  images: Prisma.JsonValue;
  isFeatured: boolean;
  isNew: boolean;
  mileage: number | null;
  price: Prisma.Decimal | number;
  priceCurrency: "TND" | "EUR";
  slug: string;
  status: "DISPONIBLE" | "VENDU" | "RESERVE" | "BROUILLON";
  title: string;
  transmission: string | null;
  year: number | null;
};

type HomeReview = {
  firstName: string;
  id: string;
  isAnonymous: boolean;
  lastName: string;
  message: string;
  rating: number;
};

const fallbackCategories: HomeCategory[] = [
  {
    description: "SUV premium familiaux.",
    icon: "suv",
    id: "suv",
    image: null,
    name: "SUV",
    slug: "suv",
  },
  {
    description: "Berlines confortables.",
    icon: "car",
    id: "berline",
    image: null,
    name: "Berline",
    slug: "berline",
  },
  {
    description: "Compactes urbaines.",
    icon: "car-front",
    id: "compacte",
    image: null,
    name: "Compacte",
    slug: "compacte",
  },
  {
    description: "Coupés sportifs.",
    icon: "gauge",
    id: "coupe",
    image: null,
    name: "Coupe",
    slug: "coupe",
  },
  {
    description: "Pickups et utilitaires.",
    icon: "truck",
    id: "pickup",
    image: null,
    name: "Pickup",
    slug: "pickup",
  },
  {
    description: "Hybrides et électriques.",
    icon: "sparkles",
    id: "hybride",
    image: null,
    name: "Hybride",
    slug: "hybride",
  },
];

const fallbackVehicles: HomeVehicle[] = [
  {
    brand: { name: "Mercedes-Benz" },
    category: { name: "Berline", slug: "berline" },
    fuelType: "ESSENCE",
    id: "fallback-mercedes",
    images: [],
    isFeatured: true,
    isNew: true,
    mileage: 72925,
    price: 128000,
    priceCurrency: "TND",
    slug: "mercedes-new-e-class",
    status: "DISPONIBLE",
    title: "Mercedes New E-Class",
    transmission: "AUTOMATIQUE",
    year: 2023,
  },
  {
    brand: { name: "BMW" },
    category: { name: "SUV", slug: "suv" },
    fuelType: "DIESEL",
    id: "fallback-bmw",
    images: [],
    isFeatured: true,
    isNew: false,
    mileage: 46200,
    price: 118000,
    priceCurrency: "TND",
    slug: "bmw-x5-m-sport",
    status: "DISPONIBLE",
    title: "BMW X5 M Sport",
    transmission: "AUTOMATIQUE",
    year: 2022,
  },
  {
    brand: { name: "Porsche" },
    category: { name: "Coupe", slug: "coupe" },
    fuelType: "HYBRIDE",
    id: "fallback-porsche",
    images: [],
    isFeatured: false,
    isNew: true,
    mileage: 18400,
    price: 156000,
    priceCurrency: "TND",
    slug: "porsche-cayenne-hybrid",
    status: "DISPONIBLE",
    title: "Porsche Cayenne Hybrid",
    transmission: "AUTOMATIQUE",
    year: 2024,
  },
  {
    brand: { name: "Genesis" },
    category: { name: "Berline", slug: "berline" },
    fuelType: "ESSENCE",
    id: "fallback-genesis",
    images: [],
    isFeatured: false,
    isNew: false,
    mileage: 31850,
    price: 94000,
    priceCurrency: "TND",
    slug: "genesis-g80-luxury",
    status: "DISPONIBLE",
    title: "Genesis G80 Luxury",
    transmission: "AUTOMATIQUE",
    year: 2023,
  },
];

const fallbackBrands: HomeBrand[] = [
  { id: "bmw", logo: null, name: "BMW", slug: "bmw" },
  { id: "mercedes", logo: null, name: "Mercedes-Benz", slug: "mercedes-benz" },
  { id: "porsche", logo: null, name: "Porsche", slug: "porsche" },
  { id: "genesis", logo: null, name: "Genesis", slug: "genesis" },
  { id: "audi", logo: null, name: "Audi", slug: "audi" },
  { id: "tesla", logo: null, name: "Tesla", slug: "tesla" },
];

const reasons: Array<[LucideIcon, string, string]> = [
  [
    CircleDollarSign,
    "Offres de financement",
    "Des solutions claires pour réserver ou acheter le véhicule adapté.",
  ],
  [
    ShieldCheck,
    "Showroom vérifié",
    "Chaque annonce garde ses informations techniques et commerciales au même endroit.",
  ],
  [
    BadgeCheck,
    "Prix transparents",
    "Prix, statut, kilométrage et disponibilité visibles dès le premier contact.",
  ],
  [
    Wrench,
    "Service expert",
    "Suivi commercial depuis le backoffice pour traiter les demandes rapidement.",
  ],
];

const iconMap: Record<string, LucideIcon> = {
  "badge-check": BadgeCheck,
  "car-front": CarFront,
  car: Car,
  gauge: Gauge,
  mountain: Truck,
  sparkles: Sparkles,
  suv: Truck,
  truck: Truck,
  users: Users,
  wagon: CarFront,
};

function getImages(images: Prisma.JsonValue) {
  if (!Array.isArray(images)) return [];

  return images.filter((image): image is string => typeof image === "string");
}

function formatPrice(price: Prisma.Decimal | number, currency: "TND" | "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Number(price));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function formatFuel(value: HomeVehicle["fuelType"]) {
  if (!value) return null;

  const labels = {
    DIESEL: "Diesel",
    ELECTRIQUE: "Electrique",
    ESSENCE: "Essence",
    HYBRIDE: "Hybride",
  };

  return labels[value];
}

function formatTransmission(value: HomeVehicle["transmission"]) {
  if (!value) return null;
  if (value !== "AUTOMATIQUE" && value !== "MANUELLE") return value;

  return value === "AUTOMATIQUE" ? "Automatique" : "Manuelle";
}

function vehicleBadge(vehicle: HomeVehicle) {
  if (vehicle.isNew) return "Nouvel arrivage";
  if (vehicle.isFeatured) return "Bon prix";
  if (vehicle.mileage !== null && vehicle.mileage < 50000) return "Faible kilométrage";

  return vehicle.status === "RESERVE" ? "Réservé" : "Disponible";
}

function vehicleImage(vehicle: HomeVehicle) {
  return getImages(vehicle.images)[0];
}

function categoryImage(category: HomeCategory, vehicles: HomeVehicle[]) {
  if (category.image) return getMediaUrl(category.image);

  const representativeVehicle = vehicles.find(
    (vehicle) =>
      vehicle.category.slug === category.slug ||
      vehicle.category.name.toLowerCase() === category.name.toLowerCase(),
  );
  const representativeImage = representativeVehicle
    ? vehicleImage(representativeVehicle)
    : null;

  return representativeImage ? getMediaUrl(representativeImage) : "/showroom-hero.png";
}

function displayReviewName(review: HomeReview) {
  return review.isAnonymous
    ? "Client anonyme"
    : `${review.firstName} ${review.lastName.charAt(0).toUpperCase()}.`;
}

function averageRating(reviews: HomeReview[]) {
  if (!reviews.length) return "0.0";

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);

  return (total / reviews.length).toFixed(1);
}

async function getHomepageData() {
  try {
    const prisma = getPrisma();

    const [
      categories,
      vehicles,
      brands,
      reviews,
      settings,
      homepageSettings,
    ] = await Promise.all([
      prisma.category.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: {
          description: true,
          icon: true,
          id: true,
          image: true,
          name: true,
          slug: true,
        },
        where: { isActive: true },
      }),
      prisma.vehicle.findMany({
        include: {
          brand: { select: { name: true } },
          category: { select: { name: true, slug: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { isNew: "desc" }, { createdAt: "desc" }],
        take: 12,
        where: { status: { not: "BROUILLON" } },
      }),
      prisma.brand.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          logo: true,
          name: true,
          slug: true,
        },
        take: 12,
        where: { isActive: true },
      }),
      prisma.review.findMany({
        orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
        select: {
          firstName: true,
          id: true,
          isAnonymous: true,
          lastName: true,
          message: true,
          rating: true,
        },
        take: 6,
        where: { isPublished: true },
      }),
      getShowroomSettings(),
      getHomepageSettings(),
    ]);

    return {
      brands: brands.length ? brands : fallbackBrands,
      categories: categories.length ? categories : fallbackCategories,
      homepageSettings,
      reviews,
      settings,
      vehicles: vehicles.length ? vehicles : fallbackVehicles,
    };
  } catch {
    return {
      brands: fallbackBrands,
      categories: fallbackCategories,
      homepageSettings: await getHomepageSettings(),
      reviews: [],
      settings: await getShowroomSettings(),
      vehicles: fallbackVehicles,
    };
  }
}

export default async function Home() {
  const { brands, categories, homepageSettings, reviews, settings, vehicles } =
    await getHomepageData();
  const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
  const heroSelections = homepageSettings.heroSlides
    .map((slide) => {
      const vehicle = vehicleById.get(slide.vehicleId);

      return vehicle ? { imagePath: slide.imagePath, vehicle } : null;
    })
    .filter(
      (item): item is { imagePath: string | null; vehicle: HomeVehicle } =>
        Boolean(item),
    );
  const heroVehicles = heroSelections.length
    ? heroSelections
    : vehicles.slice(0, 4).map((vehicle) => ({ imagePath: null, vehicle }));
  const featuredVehicles = homepageSettings.featuredVehicleIds.length
    ? homepageSettings.featuredVehicleIds
        .map((id) => vehicleById.get(id))
        .filter((vehicle): vehicle is HomeVehicle => Boolean(vehicle))
    : vehicles.slice(0, 8);
  const specialVehicles = vehicles.filter((vehicle) => vehicle.isFeatured).slice(0, 6);
  const displaySpecials = featuredVehicles.length
    ? featuredVehicles.slice(0, 6)
    : specialVehicles.length
      ? specialVehicles
      : vehicles.slice(2, 8);
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const browseCategories = homepageSettings.categoryOrder
    .map((id) => categoryById.get(id))
    .filter((category): category is HomeCategory => Boolean(category));
  const heroVehicle = heroVehicles[0]?.vehicle ?? fallbackVehicles[0];
  const spotlightVehicle =
    (homepageSettings.spotlightVehicleId
      ? vehicleById.get(homepageSettings.spotlightVehicleId)
      : null) ||
    heroVehicle ||
    fallbackVehicles[0];
  const showcaseImage = vehicleImage(spotlightVehicle);
  const spotlightVehicleHref = `/vehicles/${spotlightVehicle.slug}`;
  const heroSlides: HeroCarouselVehicle[] = heroVehicles.map(({ imagePath, vehicle }) => {
    const image = imagePath || vehicleImage(vehicle);

    return {
      badge: vehicleBadge(vehicle),
      fuel: formatFuel(vehicle.fuelType),
      imageUrl: image ? getMediaUrl(image) : "/showroom-hero.png",
      mileage:
        vehicle.mileage !== null ? `${formatNumber(vehicle.mileage)} km` : null,
      price: formatPrice(vehicle.price, vehicle.priceCurrency),
      slug: vehicle.slug,
      title: vehicle.title,
      transmission: formatTransmission(vehicle.transmission),
      year: vehicle.year ? String(vehicle.year) : null,
    };
  });
  const vehicleCount = vehicles.length || fallbackVehicles.length;

  return (
    <main className="min-h-screen bg-white text-[#1b1b1b]">
      <PublicHeader overlay settings={settings} sticky={false} />

      <HeroCarousel vehicles={heroSlides} />

      <section className="px-4 py-14 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
            {homepageSettings.aboutTitle}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#1b1b1b]/64">
            {homepageSettings.aboutText}
          </p>
        </div>
      </section>

      <Section className="pt-6" title="Parcourir par type" action="Tout voir" href="/categories">
        <div className="grid gap-5 md:grid-cols-6 lg:gap-6">
          {browseCategories.map((category, index) => {
            const Icon = iconMap[category.icon || "car"] ?? Car;
            const imageUrl = categoryImage(category, vehicles);
            const cardClass =
              index < 2
                ? "md:col-span-3"
                : "md:col-span-2";

            return (
              <Link
                className={`group relative h-[350px] overflow-hidden rounded-md bg-[#f4f4f1] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#1b1b1b]/15 ${cardClass}`}
                href="#inventory"
                key={category.id}
                title={category.description || category.name}
              >
                <Image
                  alt={category.name}
                  className="object-cover object-center transition duration-500 group-hover:scale-105"
                  fill
                  quality={90}
                  sizes={
                    index < 2
                      ? "(max-width: 768px) 100vw, 50vw"
                      : "(max-width: 768px) 100vw, 33vw"
                  }
                  src={imageUrl}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-[#1b1b1b]/20 via-transparent to-transparent opacity-70 transition group-hover:opacity-45" />
                <span className="absolute bottom-7 left-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1b1b1b] shadow-lg shadow-[#1b1b1b]/10 transition duration-300 group-hover:bg-[#ffc10a] group-hover:shadow-xl">
                  <Icon className="h-5 w-5" />
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section id="inventory" title="Explorer tous les véhicules" action="Tout voir" href="#inventory">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Tabs />
          <p className="text-sm font-semibold text-[#1b1b1b]/55">
            {vehicleCount} véhicules actuellement mis en avant
          </p>
        </div>
        <VehicleGrid vehicles={featuredVehicles} />
      </Section>

      <section className="px-4 py-12 sm:px-8">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-md bg-[#111318] text-white shadow-2xl shadow-[#1b1b1b]/15 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="relative flex flex-col justify-center p-8 md:p-12">
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#ffc10a]">
              <Sparkles className="h-4 w-4" />
              {vehicleBadge(spotlightVehicle)}
            </span>
            <p className="text-sm font-semibold uppercase text-white/48">En ligne, au showroom, partout</p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold leading-tight sm:text-4xl">
              {homepageSettings.spotlightTitle}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/68">
              {homepageSettings.spotlightDescription}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/72">
              {spotlightVehicle.year ? (
                <span className="rounded-full border border-white/12 bg-white/7 px-4 py-2">
                  {spotlightVehicle.year}
                </span>
              ) : null}
              {spotlightVehicle.mileage !== null ? (
                <span className="rounded-full border border-white/12 bg-white/7 px-4 py-2">
                  {formatNumber(spotlightVehicle.mileage)} km
                </span>
              ) : null}
              {formatTransmission(spotlightVehicle.transmission) ? (
                <span className="rounded-full border border-white/12 bg-white/7 px-4 py-2">
                  {formatTransmission(spotlightVehicle.transmission)}
                </span>
              ) : null}
            </div>
            <Link
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-[#ffc10a] px-6 py-3 text-sm font-semibold text-[#111318] shadow-lg shadow-[#ffc10a]/20 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-white/10"
              href={spotlightVehicleHref}
            >
              Découvrir
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative min-h-[320px] bg-[#f3f5f7] lg:min-h-[390px]">
            <Link className="group absolute inset-0 block" href={spotlightVehicleHref} aria-label={`Découvrir ${spotlightVehicle.title}`}>
              <Image
                alt={spotlightVehicle.title}
                className="object-cover transition duration-500 group-hover:scale-105"
                fill
                sizes="(max-width: 1024px) 100vw, 760px"
                src={showcaseImage ? getMediaUrl(showcaseImage) : "/showroom-hero.png"}
              />
              <span className="absolute inset-0 bg-gradient-to-t from-[#111318]/45 via-transparent to-transparent" />
              <span className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-3">
                <span>
                  <span className="block text-sm font-semibold text-white/75">{spotlightVehicle.brand.name}</span>
                  <span className="mt-1 block text-xl font-semibold text-white">{spotlightVehicle.title}</span>
                </span>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#111318] shadow-lg shadow-[#111318]/20">
                  {formatPrice(spotlightVehicle.price, spotlightVehicle.priceCurrency)}
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section id="why-us" className="bg-[#1b1b1b] px-4 py-20 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
            {homepageSettings.whyChooseUsTitle}
          </h2>
          <div className="mt-11 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-14">
            {homepageSettings.whyChooseUsItems.map(({ text, title }, index) => {
              const Icon = reasons[index]?.[0] ?? BadgeCheck;

              return (
                <article className="max-w-[250px]" key={title}>
                  <span className="grid h-14 w-14 place-items-center">
                    <Icon className="h-11 w-11 stroke-[1.7] text-[#ffc10a]" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold leading-6">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/82">{text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <Section title="Offres spéciales" action="Tout voir" href="#inventory">
        <VehicleGrid vehicles={displaySpecials} compact />
      </Section>

      <section
        id="brands"
        className="mt-8 rounded-t-[48px] bg-[#f7f8fa] px-4 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-3xl font-semibold leading-tight text-[#050b20] sm:text-4xl">
              Explorer les marques premium
            </h2>
            <Link
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#050b20] transition hover:text-[#ffc10a]"
              href="/marques"
            >
              Toutes les marques
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {brands.slice(0, 6).map((brand) => (
              <Link
                className="group flex min-h-[178px] flex-col items-center justify-center rounded-md border border-[#050b20]/10 bg-white px-5 py-7 text-center text-[#050b20] shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#ffc10a] hover:shadow-xl hover:shadow-[#050b20]/10"
                href={`/marques/${brand.slug}`}
                key={brand.id}
              >
                <span className="flex h-20 w-full items-center justify-center">
                  {brand.logo ? (
                    <Image
                      alt=""
                      className="max-h-16 w-auto object-contain transition duration-300 group-hover:scale-105"
                      height={64}
                      src={getMediaUrl(brand.logo)}
                      width={112}
                    />
                  ) : (
                    <span className="grid h-16 w-16 place-items-center rounded-full border border-[#050b20]/10 bg-[#f7f8fa] text-xl font-semibold">
                      {brand.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="mt-5 text-base font-semibold leading-tight">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {homepageSettings.showReviews ? (
        <section className="px-4 py-12 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
              <div>
                <h2 className="text-3xl font-semibold">Avis clients</h2>
                <p className="mt-4 text-sm leading-7 text-[#1b1b1b]/62">
                  {reviews.length
                    ? `Note moyenne ${averageRating(reviews)} / 5 basée sur les avis publiés.`
                    : "Les premiers avis publiés apparaîtront ici après validation."}
                </p>
                <div className="mt-5 flex gap-1 text-[#ffc10a]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star className="h-5 w-5 fill-current" key={index} />
                  ))}
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    className="inline-flex rounded-full bg-[#1b1b1b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ffc10a] hover:text-[#1b1b1b]"
                    href="/avis"
                  >
                    Voir les avis
                  </Link>
                  <Link
                    className="inline-flex rounded-full border border-[#1b1b1b]/10 px-5 py-2.5 text-sm font-semibold text-[#1b1b1b] transition hover:border-[#ffc10a] hover:bg-[#ffc10a]"
                    href="/donner-un-avis"
                  >
                    Donner un avis
                  </Link>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
              {reviews.slice(0, 3).map((review) => (
                <article className="rounded-md border border-[#1b1b1b]/10 bg-white p-6 shadow-sm" key={review.id}>
                  <div className="flex gap-1 text-[#ffc10a]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        className={
                          index < review.rating
                            ? "h-4 w-4 fill-current"
                            : "h-4 w-4 text-[#1b1b1b]/15"
                        }
                        key={index}
                      />
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-7 text-[#1b1b1b]/62">{review.message}</p>
                  <p className="mt-5 text-xs font-semibold uppercase text-[#1b1b1b]/45">
                    {displayReviewName(review)}
                  </p>
                </article>
              ))}
              {!reviews.length ? (
                <article className="rounded-md border border-dashed border-[#1b1b1b]/15 bg-white p-6 md:col-span-3">
                  <h3 className="font-semibold">Aucun avis publié pour le moment</h3>
                  <p className="mt-3 text-sm leading-7 text-[#1b1b1b]/62">
                    Les avis soumis depuis le formulaire seront affichés ici une fois
                    publiés par l&apos;administration.
                  </p>
                </article>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {homepageSettings.showFaqs ? (
        <section className="bg-white px-4 pb-20 pt-12 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-semibold leading-tight text-[#050b20] sm:text-4xl">
              Questions fréquentes
            </h2>
            <HomeFaqAccordion items={homepageSettings.faqItems} />
          </div>
        </section>
      ) : null}

    </main>
  );
}

function Section({
  action,
  children,
  className = "",
  href,
  id,
  title,
}: {
  action?: string;
  children: React.ReactNode;
  className?: string;
  href?: string;
  id?: string;
  title: string;
}) {
  return (
    <section className={`px-4 py-14 sm:px-8 ${className}`} id={id}>
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
          {action && href ? (
            <a className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1b1b1b] transition hover:text-[#ffc10a]" href={href}>
              {action}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function Tabs() {
  return (
    <div className="flex flex-wrap gap-6 text-sm font-semibold text-[#1b1b1b]/60">
      {["Véhicules neufs", "Occasions", "En stock"].map((item, index) => (
        <span
          className={index === 0 ? "border-b-2 border-[#ffc10a] pb-2 text-[#1b1b1b]" : "pb-2"}
          key={item}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function VehicleGrid({
  compact,
  vehicles,
}: {
  compact?: boolean;
  vehicles: HomeVehicle[];
}) {
  return (
    <div className={`grid gap-5 md:grid-cols-2 ${compact ? "xl:grid-cols-3" : "xl:grid-cols-4"}`}>
      {vehicles.map((vehicle) => {
        const image = vehicleImage(vehicle);

        return (
          <article
            className="group overflow-hidden rounded-md border border-[#1b1b1b]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1b1b1b]/10"
            key={vehicle.id}
          >
            <Link className="block" href={`/vehicles/${vehicle.slug}`}>
              <div className={compact ? "relative h-52 overflow-hidden bg-white" : "relative h-48 overflow-hidden bg-white"}>
                <Image
                  alt={vehicle.title}
                  className="object-cover transition duration-300 group-hover:scale-105"
                  fill
                  sizes={compact ? "(max-width: 1280px) 50vw, 33vw" : "(max-width: 1280px) 50vw, 25vw"}
                  src={image ? getMediaUrl(image) : "/showroom-hero.png"}
                />
                <span className="absolute left-4 top-4 rounded-full bg-[#ffc10a] px-3 py-1 text-xs font-semibold text-[#1b1b1b]">
                  {vehicleBadge(vehicle)}
                </span>
                <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white text-[#1b1b1b]">
                  <Heart className="h-4 w-4" />
                </span>
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold text-[#1b1b1b]/45">
                  {vehicle.brand.name} / {vehicle.category.name}
                </p>
                <h3 className="mt-2 line-clamp-1 font-semibold">{vehicle.title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#1b1b1b]/60">
                  {vehicle.year
                    ? `Modèle ${vehicle.year} disponible dans le stock du showroom.`
                    : "Disponible dans le stock du showroom."}
                </p>
                {[
                  vehicle.mileage !== null
                    ? `${formatNumber(vehicle.mileage)} km`
                    : null,
                  formatFuel(vehicle.fuelType),
                  formatTransmission(vehicle.transmission),
                ].some(Boolean) ? (
                  <div className="mt-4 grid grid-cols-3 gap-2 border-y border-[#1b1b1b]/10 py-3 text-center text-[11px] text-[#1b1b1b]/62">
                    {[
                      vehicle.mileage !== null
                        ? `${formatNumber(vehicle.mileage)} km`
                        : null,
                      formatFuel(vehicle.fuelType),
                      formatTransmission(vehicle.transmission),
                    ]
                      .filter(Boolean)
                      .map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                  </div>
                ) : null}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="font-semibold">
                    {formatPrice(vehicle.price, vehicle.priceCurrency)}
                  </p>
                  <span className="text-xs font-semibold text-[#1b1b1b] underline decoration-[#ffc10a] underline-offset-4">
                    Voir le détail
                  </span>
                </div>
              </div>
            </Link>
          </article>
        );
      })}
      <div className="col-span-full flex justify-center gap-3 pt-2">
        <button className="grid h-9 w-9 place-items-center rounded-full border border-[#1b1b1b]/10 transition hover:border-[#1b1b1b]" type="button" aria-label="Véhicules précédents">
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-full border border-[#1b1b1b]/10 transition hover:border-[#1b1b1b]" type="button" aria-label="Véhicules suivants">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
