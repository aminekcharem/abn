import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import {
  ArrowUpRight,
  BadgeCheck,
  Calendar,
  Car,
  CarFront,
  ChevronDown,
  CircleDollarSign,
  Fuel,
  Gauge,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Ship,
  Sparkles,
  Star,
  Truck,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  HomeInventorySearch,
  type HomeInventoryVehicle,
} from "./_components/home-inventory-search";
import { HomeFaqAccordion } from "./_components/home-faq-accordion";
import { PublicLanguageSwitch } from "./_components/public-language-switch";
import { PublicMobileMenu } from "./_components/public-mobile-menu";
import { getMediaUrl } from "@/lib/cdn";
import { getHomepageSettings } from "@/lib/homepage-settings";
import { getPrisma } from "@/lib/prisma";
import {
  getPublicBrandLinks,
  type PublicBrandLink,
} from "@/lib/public-navigation";
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
  {
    brand: { name: "Genesis" },
    category: { name: "Berline", slug: "berline" },
    fuelType: "ESSENCE",
    id: "fallback-genesis",
    images: [],
    isFeatured: false,
    isNew: false,
    mileage: 31850,
    model: "G80 Luxury",
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

const homeNavLinks = [
  { href: "/#top", label: "Accueil" },
  { href: "/#marques", label: "Marques" },
  { href: "/avis", label: "Avis" },
  { href: "/donner-un-avis", label: "Donner un avis" },
  { href: "/#contact", label: "Contact" },
];

const services: Array<[LucideIcon, string, string]> = [
  [
    CircleDollarSign,
    "Sourcing en Corée",
    "Accès au marché coréen et sélection des véhicules adaptés à votre demande.",
  ],
  [
    ShieldCheck,
    "Inspection et rapport",
    "Contrôle des informations, photos, kilométrage et statut avant la réservation.",
  ],
  [
    BadgeCheck,
    "Documentation export",
    "Facture, documents de vente et suivi administratif regroupés au même endroit.",
  ],
  [
    Ship,
    "Expédition maritime",
    "Organisation du départ depuis Busan vers Radès, Le Havre et d'autres ports.",
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
  users: Car,
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
  if (vehicle.status === "VENDU") return "Vendu";
  if (vehicle.status === "RESERVE") return "Réservé";
  if (vehicle.isNew) return "Disponible";

  return "Disponible";
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
  return {
    badge: vehicleBadge(vehicle),
    brandName: vehicle.brand.name,
    categoryName: vehicle.category?.name || "Non classé",
    categorySlug: vehicle.category?.slug || "",
    fuel: formatFuel(vehicle.fuelType),
    id: vehicle.id,
    image: vehicleImage(vehicle) || null,
    isFeatured: vehicle.isFeatured,
    mileage: vehicle.mileage,
    model: vehicle.model,
    price: Number(vehicle.price),
    priceLabel: formatPrice(vehicle.price, vehicle.priceCurrency),
    slug: vehicle.slug,
    title: vehicle.title,
    transmission: formatTransmission(vehicle.transmission),
    year: vehicle.year,
  };
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
        select: {
          brand: { select: { name: true } },
          category: { select: { name: true, slug: true } },
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
  const { brandLinks, brands, homepageSettings, reviews, settings, vehicles } =
    await getHomepageData();
  const specialVehicles = vehicles.filter((vehicle) => vehicle.isFeatured).slice(0, 6);
  const displaySpecials = specialVehicles.length ? specialVehicles : vehicles.slice(0, 3);
  const inventoryVehicles = vehicles.map(toInventoryVehicle);

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#14181d]">
      <HomeHeader brandLinks={brandLinks} settings={settings} />
      <Hero settings={settings} />

      <section id="vehicules" className="px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <HomeInventorySearch vehicles={inventoryVehicles} />
        </div>
      </section>

      <section id="marques" className="border-y border-[#e3e4e1] bg-white px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <SectionHead title="Nos marques" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {brands.slice(0, 8).map((brand) => {
              const count = vehicles.filter((vehicle) => vehicle.brand.name === brand.name).length;
              const countLabel = count > 1 ? "véhicules" : "véhicule";

              return (
                <Link
                  className="group flex min-h-[168px] flex-col items-center justify-between rounded-[10px] border border-[#e3e4e1] bg-[#f7f7f5] p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-[#f2a414] hover:bg-white hover:shadow-[0_18px_45px_rgba(20,24,29,0.08)]"
                  href={`/marques/${brand.slug}`}
                  key={brand.id}
                >
                  <span className="flex h-24 w-full items-center justify-center rounded-md border border-white bg-white px-6 shadow-[inset_0_0_0_1px_rgba(20,24,29,0.03)] transition group-hover:border-[#f2a414]/45">
                    {brand.logo ? (
                      <Image
                        alt={brand.name}
                        className="max-h-16 w-auto object-contain"
                        height={64}
                        src={getMediaUrl(brand.logo)}
                        width={150}
                      />
                    ) : (
                      <span className="grid h-16 w-16 place-items-center rounded-full bg-[#14181d] text-lg font-semibold text-white">
                        {brand.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="mt-4 block text-sm font-semibold text-[#14181d] transition group-hover:text-[#c98a0b]">
                    {brand.name}
                  </span>
                  <small className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-[#5b6470] ring-1 ring-[#e3e4e1]">
                    {count} {countLabel}
                  </small>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="services" className="bg-[#14181d] px-5 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <SectionHead dark title={homepageSettings.whyChooseUsTitle || "Pourquoi choisir AUTO PRO ?"} />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {services.map(([Icon, title, text], index) => (
              <article
                className="rounded-[10px] border border-white/10 bg-[#1f2630] p-6"
                key={title}
              >
                <div className="mb-4 font-mono text-xs font-semibold tracking-[0.18em] text-[#f2a414]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <Icon className="mb-5 h-8 w-8 text-[#f2a414]" />
                <h3 className="text-lg font-semibold uppercase tracking-normal">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/70">{homepageSettings.whyChooseUsItems[index]?.text || text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <SectionHead count={`${displaySpecials.length} sélection(s)`} title="Offres spéciales" />
          <VehicleGrid compact vehicles={displaySpecials} />
        </div>
      </section>

      {homepageSettings.showReviews ? (
        <section className="border-y border-[#e3e4e1] bg-white px-5 py-14">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.35fr_0.65fr]">
            <div>
              <SectionHead title="Avis clients" />
              <p className="text-sm leading-7 text-[#5b6470]">
                {reviews.length
                  ? `Note moyenne ${averageRating(reviews)} / 5 basée sur les avis publiés.`
                  : "Les premiers avis publiés apparaîtront ici après validation."}
              </p>
              <div className="mt-5 flex gap-1 text-[#f2a414]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star className="h-5 w-5 fill-current" key={index} />
                ))}
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {reviews.slice(0, 3).map((review) => (
                <article className="rounded-[10px] border border-[#e3e4e1] bg-[#f7f7f5] p-6" key={review.id}>
                  <div className="flex gap-1 text-[#f2a414]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        className={
                          index < review.rating
                            ? "h-4 w-4 fill-current"
                            : "h-4 w-4 text-[#14181d]/15"
                        }
                        key={index}
                      />
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-7 text-[#5b6470]">{review.message}</p>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-normal text-[#14181d]/55">
                    {displayReviewName(review)}
                  </p>
                </article>
              ))}
              {!reviews.length ? (
                <article className="rounded-[10px] border border-dashed border-[#14181d]/15 bg-[#f7f7f5] p-6 md:col-span-3">
                  <h3 className="font-semibold">Aucun avis publié pour le moment</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5b6470]">
                    Les avis soumis depuis le formulaire seront affichés ici une fois publiés par l&apos;administration.
                  </p>
                </article>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {homepageSettings.showFaqs ? (
        <section className="bg-[#f7f7f5] px-5 py-14">
          <div className="mx-auto max-w-4xl">
            <SectionHead centered title="Questions fréquentes" />
            <HomeFaqAccordion items={homepageSettings.faqItems} />
          </div>
        </section>
      ) : null}

      <ContactBand settings={settings} />
    </main>
  );
}

function HomeHeader({
  brandLinks,
  settings,
}: {
  brandLinks: PublicBrandLink[];
  settings: ShowroomSettingsView;
}) {
  const logoUrl = settings.websiteLogoUrl || settings.logoUrl;
  const mobileLinks = brandLinks.length
    ? homeNavLinks.flatMap((link) =>
        link.label === "Marques"
          ? [
              link,
              ...brandLinks.map((brand) => ({
                href: brand.href,
                label: `Marques - ${brand.label}`,
              })),
            ]
          : [link],
      )
    : homeNavLinks;

  return (
    <header className="sticky top-0 z-[280] bg-[#14181d] text-white">
      <div className="mx-auto flex min-h-[68px] max-w-6xl items-center justify-between gap-4 px-5">
        <Link className="flex min-w-0 items-center gap-3" href="/" aria-label={settings.companyName}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={settings.companyName}
              className="block max-h-[38px] max-w-[210px] object-contain"
              height={settings.logoHeight}
              src={logoUrl}
              width={settings.logoWidth}
            />
          ) : (
            <span className="text-xl font-semibold uppercase tracking-[0.12em]">
              {settings.companyName}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-white/85 lg:flex">
          <Link className="transition hover:text-[#f2a414]" href="/#top">Accueil</Link>
          <div className="group relative">
            <Link
              className="inline-flex items-center gap-1 transition hover:text-[#f2a414]"
              href="/marques"
            >
              Marques
              <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
            </Link>
            {brandLinks.length ? (
              <div className="invisible absolute left-1/2 top-full z-[320] w-64 -translate-x-1/2 pt-3 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="rounded-md border border-white/10 bg-[#14181d] p-2 shadow-2xl shadow-black/35">
                  {brandLinks.map((brand) => (
                    <Link
                      className="flex min-h-10 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-white/82 transition hover:bg-white/10 hover:text-white"
                      href={brand.href}
                      key={brand.href}
                    >
                      <span className="truncate">{brand.label}</span>
                      <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/62">
                        {brand.vehicleCount}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <Link className="transition hover:text-[#f2a414]" href="/#services">Services</Link>
          <Link className="transition hover:text-[#f2a414]" href="/#contact">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <PublicLanguageSwitch />
          <a
            className="hidden font-mono text-xs font-medium text-white/90 md:inline"
            href={phoneHref(settings.contactPhone)}
          >
            {settings.contactPhone}
          </a>
          <PublicMobileMenu links={mobileLinks} />
        </div>
      </div>
    </header>
  );
}

function Hero({ settings }: { settings: ShowroomSettingsView }) {
  return (
    <section id="top" className="relative overflow-hidden bg-[linear-gradient(160deg,#14181d_0%,#1f2630_55%,#2a3442_100%)] px-5 pt-16 text-white">
      <div className="absolute -right-28 -top-20 h-[520px] w-[520px] rounded-full border border-[#f2a414]/35" />
      <div className="absolute -right-10 top-5 h-[340px] w-[340px] rounded-full border border-white/10" />
      <div className="relative mx-auto max-w-6xl pb-10">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-[#c9a24b]">
          Export de véhicules coréens - Corée du Sud
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold uppercase leading-[1.08] tracking-normal sm:text-5xl lg:text-[52px]">
          Votre voiture coréenne, <span className="text-[#f2a414]">livrée à votre port.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
          Sourcing, inspection, documentation export et expédition maritime depuis Busan avec l&apos;équipe {settings.companyName}.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-xs text-white/85">
          <span className="rounded-md border border-white/30 bg-white/5 px-3 py-2">BUSAN - KR</span>
          <span className="h-px w-14 bg-[repeating-linear-gradient(90deg,#f2a414_0_8px,transparent_8px_14px)]" />
          <span className="rounded-md border border-white/30 bg-white/5 px-3 py-2">RADÈS - TN</span>
          <span className="h-px w-14 bg-[repeating-linear-gradient(90deg,#f2a414_0_8px,transparent_8px_14px)]" />
          <span className="rounded-md border border-white/30 bg-white/5 px-3 py-2">LE HAVRE - FR</span>
          <span className="text-[#c9a24b]">CIF / CIP - RoRo &amp; Conteneur</span>
        </div>
      </div>
    </section>
  );
}

function SectionHead({
  centered = false,
  count,
  dark = false,
  title,
}: {
  centered?: boolean;
  count?: string;
  dark?: boolean;
  title: string;
}) {
  return (
    <div className={`mb-7 flex flex-wrap items-end gap-4 ${centered ? "justify-center text-center" : "justify-between"}`}>
      <h2 className={`text-2xl font-semibold uppercase tracking-normal sm:text-3xl ${dark ? "text-white" : "text-[#14181d]"}`}>
        {title}
        <span className={`mx-0 mt-2 block h-0.5 w-14 bg-[#f2a414] ${centered ? "mx-auto" : ""}`} />
      </h2>
      {count ? <span className="font-mono text-xs text-[#5b6470]">{count}</span> : null}
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
    <div className={`grid gap-5 ${compact ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"}`}>
      {vehicles.map((vehicle) => {
        const image = vehicleImage(vehicle);
        const Icon = iconMap[vehicle.category?.slug || "car"] ?? Car;

        return (
          <article
            className="flex overflow-hidden rounded-[10px] bg-white shadow-[0_6px_24px_rgba(20,24,29,0.08)] transition hover:-translate-y-1"
            key={vehicle.id}
          >
            <Link className="flex w-full flex-col" href={`/vehicles/${vehicle.slug}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-[#1f2630]">
                {image ? (
                  <Image
                    alt={vehicle.title}
                    className="object-cover transition duration-300 hover:scale-105"
                    fill
                    sizes={compact ? "(max-width: 900px) 100vw, 33vw" : "(max-width: 900px) 100vw, 33vw"}
                    src={getMediaUrl(image)}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 bg-[linear-gradient(150deg,#232b36,#161b22)] text-white/45">
                    <Icon className="h-12 w-12" />
                    <small className="font-mono text-xs uppercase tracking-[0.18em]">
                      {vehicle.brand.name}
                    </small>
                  </div>
                )}
                <span className="absolute left-3 top-3 rounded-md bg-[#1f7a3d] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                  {vehicleBadge(vehicle)}
                </span>
                {vehicle.isFeatured ? (
                  <span className="absolute right-3 top-3 rounded-md bg-black/55 px-3 py-1 text-[11px] font-semibold text-white">
                    Rapport
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="min-h-11 text-base font-semibold leading-snug">{vehicle.title}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-[#5b6470]">
                  {vehicle.mileage !== null ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Gauge className="h-3.5 w-3.5" />
                      {formatNumber(vehicle.mileage)} km
                    </span>
                  ) : null}
                  {formatFuel(vehicle.fuelType) ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Fuel className="h-3.5 w-3.5" />
                      {formatFuel(vehicle.fuelType)}
                    </span>
                  ) : null}
                  {formatTransmission(vehicle.transmission) ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5" />
                      {formatTransmission(vehicle.transmission)}
                    </span>
                  ) : null}
                  {vehicle.year ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {vehicle.year}
                    </span>
                  ) : null}
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#e3e4e1] pt-4">
                  <div>
                    <span className="text-xl font-semibold">{formatPrice(vehicle.price, vehicle.priceCurrency)}</span>
                    <div className="text-[11px] text-[#5b6470]">Hors frais de transport</div>
                  </div>
                  <span className="rounded-md bg-[#14181d] px-4 py-2 text-xs font-semibold text-white transition group-hover:bg-[#f2a414] group-hover:text-[#14181d]">
                    Voir détails
                  </span>
                </div>
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}

function ContactBand({ settings }: { settings: ShowroomSettingsView }) {
  return (
    <section id="contact" className="bg-[#f2a414] px-5 py-11 text-[#14181d]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5">
        <div>
          <h2 className="text-2xl font-semibold uppercase tracking-normal sm:text-3xl">
            Un véhicule vous intéresse ?
          </h2>
          <p className="mt-2 text-sm text-[#14181d]/80">
            Réponse rapide par téléphone, email ou message direct.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
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
              Busan / Gyeongju
            </span>
          </div>
        </div>
        <a
          className="inline-flex items-center gap-2 rounded-lg bg-[#14181d] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
          href={phoneHref(settings.contactPhone)}
        >
          Nous contacter
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
