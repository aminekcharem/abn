import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import {
  ArrowUpRight,
  BadgeCheck,
  Car,
  ChevronLeft,
  ChevronRight,
  CircleArrowRight,
  CircleDollarSign,
  Headphones,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";

import { AutrivaInventorySearch } from "./_components/autriva-inventory-search";
import type { HomeInventoryVehicle } from "./_components/home-inventory-search";
import { HeroCarousel, type HeroCarouselVehicle } from "./_components/hero-carousel";
import { HomeFaqAccordion } from "./_components/home-faq-accordion";
import { PublicHeader } from "./_components/public-header";
import { getMediaUrl } from "@/lib/cdn";
import { getHomepageSettings, type HomepageSettingsView } from "@/lib/homepage-settings";
import { getPrisma } from "@/lib/prisma";
import { getPublicBrandLinks } from "@/lib/public-navigation";
import { getShowroomSettings, type ShowroomSettingsView } from "@/lib/settings";

export const revalidate = 300;

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
  category: { name: string; slug: string } | null;
  createdAt?: Date | string;
  fuelType: "ESSENCE" | "DIESEL" | "HYBRIDE" | "ELECTRIQUE" | null;
  id: string;
  images: Prisma.JsonValue;
  isFeatured: boolean;
  isNew: boolean;
  mileage: number | null;
  model: string | null;
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
  { description: "SUV premium familiaux.", icon: "suv", id: "suv", image: null, name: "SUV", slug: "suv" },
  { description: "Berlines confortables.", icon: "car", id: "berline", image: null, name: "Berline", slug: "berline" },
  { description: "Compactes urbaines.", icon: "car-front", id: "compacte", image: null, name: "Compacte", slug: "compacte" },
  { description: "Coupes sportifs.", icon: "gauge", id: "coupe", image: null, name: "Coupe", slug: "coupe" },
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
    model: "New E-Class",
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
    model: "X5 M Sport",
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
    model: "Cayenne Hybrid",
    price: 156000,
    priceCurrency: "TND",
    slug: "porsche-cayenne-hybrid",
    status: "DISPONIBLE",
    title: "Porsche Cayenne Hybrid",
    transmission: "AUTOMATIQUE",
    year: 2024,
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

const serviceIcons = [BadgeCheck, ShieldCheck, CircleDollarSign, Headphones];

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

function vehicleImage(vehicle: HomeVehicle) {
  return getImages(vehicle.images)[0];
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

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function toInventoryVehicle(vehicle: HomeVehicle): HomeInventoryVehicle {
  const images = getImages(vehicle.images);

  return {
    brandName: vehicle.brand.name,
    categoryName: vehicle.category?.name || "Non classe",
    categorySlug: vehicle.category?.slug || "",
    fuel: formatFuel(vehicle.fuelType),
    id: vehicle.id,
    image: images[0] || null,
    imageCount: images.length,
    isFeatured: vehicle.isFeatured,
    isNew: vehicle.isNew,
    mileage: vehicle.mileage,
    model: vehicle.model,
    price: Number(vehicle.price),
    priceLabel: formatPrice(vehicle.price, vehicle.priceCurrency),
    slug: vehicle.slug,
    status: vehicle.status,
    title: vehicle.title,
    transmission: formatTransmission(vehicle.transmission),
    year: vehicle.year,
  };
}

function getVehicleCreatedAtTime(vehicle: HomeVehicle) {
  return vehicle.createdAt ? new Date(vehicle.createdAt).getTime() : 0;
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
      brandLinks,
    ] = await Promise.all([
      prisma.category.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: { description: true, icon: true, id: true, image: true, name: true, slug: true },
        where: { isActive: true },
      }),
      prisma.vehicle.findMany({
        select: {
          brand: { select: { name: true } },
          category: { select: { name: true, slug: true } },
          createdAt: true,
          fuelType: true,
          id: true,
          images: true,
          isFeatured: true,
          isNew: true,
          mileage: true,
          model: true,
          price: true,
          priceCurrency: true,
          slug: true,
          status: true,
          title: true,
          transmission: true,
          year: true,
        },
        orderBy: [{ isFeatured: "desc" }, { isNew: "desc" }, { createdAt: "desc" }],
        where: { status: { not: "BROUILLON" } },
      }),
      prisma.brand.findMany({
        orderBy: { name: "asc" },
        select: { id: true, logo: true, name: true, slug: true },
        take: 12,
        where: { isActive: true },
      }),
      prisma.review.findMany({
        orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
        select: { firstName: true, id: true, isAnonymous: true, lastName: true, message: true, rating: true },
        take: 6,
        where: { isPublished: true },
      }),
      getShowroomSettings(),
      getHomepageSettings(),
      getPublicBrandLinks(),
    ]);

    return {
      brandLinks,
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
      brandLinks: [],
      categories: fallbackCategories,
      homepageSettings: await getHomepageSettings(),
      reviews: [],
      settings: await getShowroomSettings(),
      vehicles: fallbackVehicles,
    };
  }
}

export default async function Home() {
  const { brandLinks, brands, categories, homepageSettings, reviews, settings, vehicles } =
    await getHomepageData();
  const sortedVehicles = [...vehicles].sort(
    (first, second) => getVehicleCreatedAtTime(second) - getVehicleCreatedAtTime(first),
  );
  const inventoryVehicles = sortedVehicles.slice(0, 8).map(toInventoryVehicle);
  const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
  const selectedHeroVehicles = homepageSettings.heroSlides
    .map((slide) => {
      const vehicle = vehicleById.get(slide.vehicleId);

      if (!vehicle) return null;

      return { imagePath: slide.imagePath, vehicle };
    })
    .filter((item): item is { imagePath: string | null; vehicle: HomeVehicle } => Boolean(item));
  const heroSourceVehicles = selectedHeroVehicles.length
    ? selectedHeroVehicles
    : sortedVehicles.slice(0, 4).map((vehicle) => ({ imagePath: null, vehicle }));
  const heroVehicles: HeroCarouselVehicle[] = heroSourceVehicles.map(({ imagePath, vehicle }) => {
    const firstImagePath = imagePath || vehicleImage(vehicle);

    return {
      badge: vehicle.brand.name,
      fuel: formatFuel(vehicle.fuelType),
      imageUrl: firstImagePath ? getMediaUrl(firstImagePath) : "/showroom-hero.png",
      mileage: vehicle.mileage
        ? `${new Intl.NumberFormat("fr-FR").format(vehicle.mileage)} km`
        : null,
      price: formatPrice(vehicle.price, vehicle.priceCurrency),
      slug: vehicle.slug,
      title: vehicle.title,
      transmission: formatTransmission(vehicle.transmission),
      year: vehicle.year ? String(vehicle.year) : null,
    };
  });

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
      <PublicHeader brandLinks={brandLinks} settings={settings} />
      <HeroCarousel vehicles={heroVehicles} />

      <section id="vehicules" className="relative z-20 -mt-16 px-5 pb-14">
        <div className="mx-auto max-w-7xl">
          <AutrivaInventorySearch vehicles={inventoryVehicles} />
        </div>
      </section>

      <ModelSection categories={categories} vehicles={vehicles} />
      <ReputableSection
        homepageSettings={homepageSettings}
        settings={settings}
        vehicle={sortedVehicles[0]}
        vehicleCount={vehicles.length}
      />
      <WhyChooseSection homepageSettings={homepageSettings} />
      <ActionBanners settings={settings} />
      <BrandSearchSection brands={brands} />

      {homepageSettings.showReviews ? (
        <CustomerFeedbackSection reviews={reviews} vehicle={sortedVehicles[0]} />
      ) : null}

      {homepageSettings.showFaqs ? (
        <section className="bg-white px-5 py-16">
          <div className="mx-auto max-w-4xl">
            <SectionHead centered title="Questions frequentes" />
            <HomeFaqAccordion items={homepageSettings.faqItems} />
          </div>
        </section>
      ) : null}

      <ContactBand settings={settings} />
    </main>
  );
}

function CustomerFeedbackSection({
  reviews,
  vehicle,
}: {
  reviews: HomeReview[];
  vehicle: HomeVehicle | undefined;
}) {
  const featuredReview = reviews[0];
  const imagePath = vehicle ? vehicleImage(vehicle) : null;
  const reviewCountLabel = reviews.length
    ? `${averageRating(reviews)} rating of ${new Intl.NumberFormat("fr-FR").format(reviews.length)} reviews`
    : "Avis clients en cours de publication";

  return (
    <section className="relative overflow-hidden bg-[#23272d] text-white">
      <div className="grid min-h-[560px] lg:grid-cols-2">
        <div className="relative min-h-[340px] bg-[#0b0d10] lg:min-h-[560px]">
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            src={imagePath ? getMediaUrl(imagePath) : "/showroom-hero.png"}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.16),rgba(0,0,0,0.02)),linear-gradient(0deg,rgba(0,0,0,0.12),rgba(0,0,0,0))]" />
        </div>

        <div className="flex items-center px-5 py-16 sm:px-10 lg:px-20">
          <article className="w-full max-w-[560px]">
            <h2 className="text-3xl font-bold leading-tight tracking-normal text-white sm:text-4xl">
              Ce que disent nos clients
            </h2>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="flex gap-1 text-[#f6c400]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    className={
                      featuredReview && index >= featuredReview.rating
                        ? "h-4 w-4 text-white/20"
                        : "h-4 w-4 fill-current"
                    }
                    key={index}
                  />
                ))}
              </div>
              <p className="text-xs font-semibold text-white/45">{reviewCountLabel}</p>
            </div>

            {featuredReview ? (
              <>
                <blockquote className="mt-11 text-2xl font-semibold leading-snug text-white/90">
                  &quot;{featuredReview.message}&quot;
                </blockquote>
                <div className="mt-10">
                  <p className="text-base font-bold text-white">
                    {displayReviewName(featuredReview)}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white/35">Client verifie</p>
                </div>
              </>
            ) : (
              <>
                <blockquote className="mt-11 text-2xl font-semibold leading-snug text-white/90">
                  &quot;Les premiers avis publies apparaitront ici apres validation par notre equipe.&quot;
                </blockquote>
                <div className="mt-10">
                  <p className="text-base font-bold text-white">Abn Motors</p>
                  <p className="mt-1 text-xs font-semibold text-white/35">Service client</p>
                </div>
              </>
            )}

            <div className="mt-20 flex items-center gap-4">
              <button
                aria-label="Avis precedent"
                className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-transparent text-white/80 transition hover:border-white/25 hover:bg-white/5"
                disabled={reviews.length < 2}
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                aria-label="Avis suivant"
                className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-transparent text-white/80 transition hover:border-white/25 hover:bg-white/5"
                disabled={reviews.length < 2}
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function SectionHead({
  centered = false,
  title,
}: {
  centered?: boolean;
  title: string;
}) {
  return (
    <div className={`mb-8 ${centered ? "text-center" : ""}`}>
      <h2 className="text-3xl font-bold tracking-normal text-[#111111] sm:text-4xl">{title}</h2>
      <span className={`mt-3 block h-1 w-14 rounded-full bg-[#a21d2f] ${centered ? "mx-auto" : ""}`} />
    </div>
  );
}

function ModelSection({
  categories,
  vehicles,
}: {
  categories: HomeCategory[];
  vehicles: HomeVehicle[];
}) {
  return (
    <section className="bg-[#f7f7f5] px-5 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-normal text-[#111111] sm:text-4xl">
            Trouvez par carrosserie
          </h2>
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-[#111111] transition hover:text-[#a21d2f]"
            href="/categories"
          >
            Voir tout
            <CircleArrowRight className="h-5 w-5" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {categories.slice(0, 6).map((category) => {
            const count = vehicles.filter((vehicle) => vehicle.category?.slug === category.slug).length;
            const image = category.image?.startsWith("/uploads/") ? category.image : null;

            return (
              <Link
                className="group flex min-h-[176px] flex-col items-center justify-center rounded-md border border-[#e7e7e7] bg-white px-5 py-7 text-center shadow-[0_10px_26px_rgba(20,24,29,0.04)] transition hover:-translate-y-1 hover:border-[#a21d2f]/45 hover:shadow-[0_18px_40px_rgba(17,17,17,0.08)]"
                href={`/categories?category=${category.slug}`}
                key={category.id}
              >
                <span className="grid h-16 w-full place-items-center text-[#8e939a] transition group-hover:text-[#a21d2f]">
                  {image ? (
                    <Image
                      alt={category.name}
                      className="h-full w-full object-contain"
                      height={72}
                      src={getMediaUrl(image)}
                      width={170}
                    />
                  ) : (
                    <Car className="h-12 w-12 stroke-[1.5]" />
                  )}
                </span>
                <span className="mt-7 block text-lg font-bold leading-tight text-[#2b2f34] group-hover:text-[#a21d2f]">
                  {category.name}
                </span>
                <span className="mt-2 block text-xs text-[#6f7378]">{count} vehicule(s)</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ReputableSection({
  homepageSettings,
  settings,
  vehicle,
  vehicleCount,
}: {
  homepageSettings: HomepageSettingsView;
  settings: ShowroomSettingsView;
  vehicle: HomeVehicle | undefined;
  vehicleCount: number;
}) {
  const imagePath = vehicle ? vehicleImage(vehicle) : null;

  return (
    <section className="bg-[#080808] px-5 py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.42fr_0.58fr] lg:items-center">
        <div className="relative min-h-[360px] overflow-hidden rounded-md bg-[#151515] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
          {imagePath ? (
            <Image alt="" className="object-cover" fill sizes="(max-width: 1024px) 100vw, 42vw" src={getMediaUrl(imagePath)} />
          ) : (
            <div className="grid h-full min-h-[360px] place-items-center text-white/40">
              <Car className="h-24 w-24" />
            </div>
          )}
          <div className="absolute left-6 top-6 rounded-md bg-[#a21d2f] px-6 py-5 text-center shadow-[0_16px_36px_rgba(0,0,0,0.25)]">
            <div className="text-4xl font-bold">{vehicleCount}</div>
            <p className="text-sm font-semibold">Vehicules</p>
          </div>
        </div>
        <div>
          {settings.websiteLogoUrl || settings.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={settings.companyName}
              className="mb-8 max-h-12 w-auto object-contain"
              src={settings.websiteLogoUrl || settings.logoUrl || ""}
            />
          ) : null}
          <h2 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            {homepageSettings.aboutTitle || `${settings.companyName} is a reputable platform for car listings`}
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/70">
            {homepageSettings.aboutText || "Nous connectons les acheteurs a des vehicules verifies, avec suivi, inspection et accompagnement jusqu'a l'export."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#a21d2f] px-6 text-sm font-bold text-white" href="/#contact">
            Vendre
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/20 px-6 text-sm font-bold text-white" href="/#vehicules">
            Voir le stock
              <Search className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyChooseSection({
  homepageSettings,
}: {
  homepageSettings: HomepageSettingsView;
}) {
  return (
    <section id="services" className="bg-[#f7f7f5] px-5 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {homepageSettings.whyChooseUsTitle || "Pourquoi nous choisir"}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[#5b6470]">
            Service fiable, conseils experts et solutions centrees client.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {homepageSettings.whyChooseUsItems.slice(0, 4).map((item, index) => {
            const Icon = serviceIcons[index] || BadgeCheck;

            return (
              <article
                className="rounded-md border border-[#ececec] bg-white p-7 shadow-[0_12px_34px_rgba(20,24,29,0.06)] transition hover:-translate-y-1 hover:border-[#a21d2f]/35 hover:shadow-[0_18px_42px_rgba(20,24,29,0.1)]"
                key={`${item.title}-${index}`}
              >
                <Icon className="h-14 w-14 text-[#a21d2f]" />
                <h3 className="mt-6 text-xl font-bold text-[#111111]">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#5b6470]">{item.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ActionBanners({ settings }: { settings: ShowroomSettingsView }) {
  return (
    <section className="bg-[#f7f7f5] px-5 py-6 pb-20">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
        <article className="relative min-h-[280px] overflow-hidden rounded-md bg-[#090909] p-8 text-white">
          <div className="relative z-10 max-w-sm">
            <h3 className="text-3xl font-bold">Vous cherchez une voiture ?</h3>
            <p className="mt-4 text-sm leading-7 text-white/70">
              Trouvez une voiture fiable avec inspection, photos et informations claires.
            </p>
            <Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white" href="/#vehicules">
              Voir les vehicules
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <Car className="absolute bottom-6 right-6 h-32 w-32 text-white/12" />
        </article>
        <article className="relative min-h-[280px] overflow-hidden rounded-md bg-[#a21d2f] p-8 text-white">
          <div className="relative z-10 max-w-sm">
            <h3 className="text-3xl font-bold">Vous souhaitez vendre ?</h3>
            <p className="mt-4 text-sm leading-7 text-white/80">
              Contactez notre equipe pour l&apos;evaluation, les documents et le suivi commercial.
            </p>
            <a className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white" href={phoneHref(settings.contactPhone)}>
              Nous appeler
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <CircleDollarSign className="absolute bottom-6 right-6 h-32 w-32 text-white/18" />
        </article>
      </div>
    </section>
  );
}

function BrandSearchSection({
  brands,
}: {
  brands: HomeBrand[];
}) {
  return (
    <section id="marques" className="bg-white px-5 py-20">
      <div className="mx-auto max-w-[1476px]">
        <div className="mb-11 flex items-center justify-between gap-5">
          <h2 className="text-3xl font-bold tracking-normal text-[#111111] sm:text-[38px]">
            Marques populaires
          </h2>
          <Link
            className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-black transition hover:text-[#a21d2f] sm:text-base"
            href="/marques"
          >
            Voir tout
            <CircleArrowRight className="h-5 w-5" strokeWidth={2} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-7 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9">
          {brands.slice(0, 9).map((brand) => (
            <Link
              className="group flex min-w-0 flex-col items-center text-center"
              href={`/marques/${brand.slug}`}
              key={brand.id}
            >
              <span className="grid h-[120px] w-[120px] place-items-center rounded-full border border-[#f0f0f0] bg-white px-6 shadow-[0_10px_22px_rgba(20,24,29,0.08)] transition group-hover:-translate-y-1 group-hover:border-[#a21d2f]/35 group-hover:shadow-[0_16px_32px_rgba(20,24,29,0.12)] sm:h-[122px] sm:w-[122px]">
                {brand.logo ? (
                  <Image
                    alt={brand.name}
                    className="max-h-[64px] w-auto max-w-[82px] object-contain"
                    height={64}
                    src={getMediaUrl(brand.logo)}
                    width={96}
                  />
                ) : (
                  <span className="text-xl font-bold text-[#111111]">
                    {brand.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="mt-4 block max-w-full truncate text-sm font-semibold text-[#2d3035] transition group-hover:text-[#a21d2f]">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactBand({ settings }: { settings: ShowroomSettingsView }) {
  return (
      <section id="contact" className="bg-[#111111] px-5 py-14 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5">
        <div>
          <h2 className="text-3xl font-bold">Un vehicule vous interesse ?</h2>
          <p className="mt-2 text-sm text-white/70">
            Reponse rapide par telephone, email ou message direct.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
            <a className="inline-flex items-center gap-2" href={phoneHref(settings.contactPhone)}>
              <Phone className="h-4 w-4" />
              {settings.contactPhone}
            </a>
            <a className="inline-flex items-center gap-2" href={`mailto:${settings.contactEmail}`}>
              <Mail className="h-4 w-4" />
              {settings.contactEmail}
            </a>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Bonabéri, Cameroun
            </span>
          </div>
        </div>
        <a
          className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#a21d2f] px-6 text-sm font-bold text-white transition hover:bg-white hover:text-[#111111]"
          href={phoneHref(settings.contactPhone)}
        >
          Nous contacter
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
