import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
import {
  BadgeCheck,
  Calendar,
  CarFront,
  CheckCircle2,
  DoorOpen,
  FileText,
  Fuel,
  Gauge,
  Mail,
  MessageCircle,
  Palette,
  Phone,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { auth } from "@/auth";
import { getMediaUrl } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";
import { getPublicBrandLinks } from "@/lib/public-navigation";
import {
  getVehicleStatusBadgeClassName,
  getVehicleStatusLabel,
  type PublicVehicleStatus,
} from "@/lib/public-vehicle-status";
import { getShowroomSettings } from "@/lib/settings";
import { PublicHeader } from "../../_components/public-header";
import { VehicleGallery } from "./vehicle-gallery";

export const dynamic = "force-dynamic";

type VehiclePageProps = {
  params: Promise<{ slug: string }>;
};

function getImages(images: Prisma.JsonValue) {
  if (!Array.isArray(images)) return [];

  return images.filter((image): image is string => typeof image === "string");
}

function getVideos(videos: Prisma.JsonValue) {
  if (!Array.isArray(videos)) return [];

  return videos.filter((video): video is string => typeof video === "string");
}

function getPublicAssetUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : getMediaUrl(value);
}

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function whatsappHref(phone: string, message: string) {
  const cleanPhone = phone.replace(/[^\d]/g, "");

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
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

function formatDate(value: Date | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(value);
}

function parseColor(value: string | null) {
  const match = value?.match(/^(.*)\s+\((#[0-9a-f]{3,8})\)$/i);

  if (!match) return { hex: null, name: value || null };

  return { hex: match[2], name: match[1] };
}

function textSummary(value: string | null | undefined, fallback: string) {
  const clean = value?.replace(/\s+/g, " ").trim();

  if (!clean) return fallback;

  return clean.length > 155 ? `${clean.slice(0, 152)}...` : clean;
}

async function getVehicle(slug: string, includeDrafts = false) {
  const prisma = getPrisma();

  return prisma.vehicle.findFirst({
    select: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
      categoryId: true,
      color: true,
      description: true,
      displacement: true,
      doors: true,
      engine: true,
      engineCode: true,
      firstRegistrationDate: true,
      fuelType: true,
      gearbox: true,
      generation: true,
      id: true,
      images: true,
      inspectionReportUrl: true,
      isFeatured: true,
      isNew: true,
      mileage: true,
      model: true,
      motorization: true,
      options: {
        orderBy: [{ category: { order: "asc" } }, { name: "asc" }],
        select: {
          id: true,
          name: true,
        },
      },
      power: true,
      price: true,
      priceCurrency: true,
      registration: true,
      seats: true,
      status: true,
      title: true,
      transmission: true,
      trim: true,
      videos: true,
      vin: true,
      year: true,
    },
    where: {
      slug,
      ...(includeDrafts ? {} : { status: { not: "BROUILLON" } }),
    },
  });
}

export async function generateMetadata({
  params,
}: VehiclePageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);

  if (!vehicle) {
    return {
      title: "Véhicule introuvable | AutoPro Korea",
    };
  }

  const images = getImages(vehicle.images).map(getMediaUrl);
  const fallbackDetails = [
    vehicle.year,
    vehicle.fuelType?.toLowerCase(),
    vehicle.transmission?.toLowerCase(),
  ]
    .filter(Boolean)
    .join(", ");
  const description = textSummary(
    vehicle.description,
    `${vehicle.brand.name} ${vehicle.title}${fallbackDetails ? `, ${fallbackDetails}` : ""}.`,
  );

  return {
    title: `${vehicle.title}${vehicle.year ? ` ${vehicle.year}` : ""} | AutoPro Korea`,
    description,
    openGraph: {
      description,
      images,
      title: `${vehicle.title}${vehicle.year ? ` ${vehicle.year}` : ""}`,
      type: "website",
    },
  };
}

export default async function VehicleDetailsPage({
  params,
}: VehiclePageProps) {
  const [{ slug }, session] = await Promise.all([
    params,
    auth(),
  ]);
  const [vehicle, settings, brandLinks] = await Promise.all([
    getVehicle(slug, Boolean(session?.user)),
    getShowroomSettings(),
    getPublicBrandLinks(),
  ]);

  if (!vehicle) {
    notFound();
  }

  const vehicleCategoryName = vehicle.category?.name || "Non classé";
  const images = getImages(vehicle.images);
  const videos = getVideos(vehicle.videos);
  const galleryImages = images.length
    ? images.map((image, index) => ({
        alt: `${vehicle.title} vue ${index + 1}`,
        src: getMediaUrl(image),
      }))
    : [{ alt: vehicle.title, src: "/showroom-hero.png" }];
  const color = parseColor(vehicle.color);
  const firstRegistration = formatDate(vehicle.firstRegistrationDate);
  const vehicleOptions = vehicle.options.map((option) => ({
    id: option.id,
    name: option.name,
  }));
  const contactMessage = `Bonjour, je suis intéressé par le véhicule ${vehicle.title}.`;
  const whatsappUrl = whatsappHref(settings.contactPhone, contactMessage);
  const inspectionReportUrl = vehicle.inspectionReportUrl
    ? getPublicAssetUrl(vehicle.inspectionReportUrl)
    : null;

  const relatedVehicles = vehicle.categoryId
    ? await getPrisma().vehicle.findMany({
        select: {
          brand: { select: { name: true } },
          category: { select: { name: true } },
          id: true,
          images: true,
          price: true,
          priceCurrency: true,
          slug: true,
          title: true,
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 3,
        where: {
          categoryId: vehicle.categoryId,
          id: { not: vehicle.id },
          status: { not: "BROUILLON" },
        },
      })
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    brand: vehicle.brand.name,
    ...(color.name ? { color: color.name } : {}),
    description: textSummary(vehicle.description, vehicle.title),
    ...(vehicle.fuelType ? { fuelType: vehicle.fuelType } : {}),
    image: images.map(getMediaUrl),
    ...(vehicle.mileage !== null
      ? {
          mileageFromOdometer: {
            "@type": "QuantitativeValue",
            unitCode: "KMT",
            value: vehicle.mileage,
          },
        }
      : {}),
    model: vehicle.model || vehicle.title,
    name: vehicle.title,
    offers: {
      "@type": "Offer",
      availability:
        vehicle.status === "DISPONIBLE"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      price: Number(vehicle.price),
      priceCurrency: vehicle.priceCurrency,
    },
    ...(vehicle.power || vehicle.engine
      ? {
          vehicleEngine: {
            "@type": "EngineSpecification",
            ...(vehicle.power ? { enginePower: `${vehicle.power} CV` } : {}),
            ...(vehicle.engine ? { engineType: vehicle.engine } : {}),
          },
        }
      : {}),
    ...(vehicle.year ? { vehicleModelDate: vehicle.year } : {}),
    ...(vehicle.transmission ? { vehicleTransmission: vehicle.transmission } : {}),
  };

  const essentialRows = [
    vehicle.year ? ["Année", String(vehicle.year)] : null,
    vehicle.mileage !== null
      ? ["Kilométrage", `${formatNumber(vehicle.mileage)} km`]
      : null,
    vehicle.fuelType ? ["Carburant", vehicle.fuelType.toLowerCase()] : null,
    vehicle.transmission
      ? ["Transmission", vehicle.transmission.toLowerCase()]
      : null,
    vehicle.power ? ["Puissance", `${vehicle.power} CV`] : null,
    vehicle.seats ? ["Places", `${vehicle.seats} places`] : null,
    vehicle.doors ? ["Portes", `${vehicle.doors} portes`] : null,
    color.name ? ["Couleur", color.name] : null,
  ].filter((spec): spec is [string, string] => Boolean(spec));

  const technicalRows = [
    ["Marque", vehicle.brand.name],
    ["Catégorie", vehicleCategoryName],
    ["Modèle", vehicle.model],
    ["Génération", vehicle.generation],
    ["Finition", vehicle.trim],
    ["Motorisation", vehicle.motorization],
    ["Moteur", vehicle.engine],
    ["Code moteur", vehicle.engineCode],
    ["Cylindrée", vehicle.displacement],
    ["Boîte", vehicle.gearbox],
    ["Première immatriculation", firstRegistration],
    ["Immatriculation", vehicle.registration],
    ["VIN", vehicle.vin],
  ].filter(([, value]) => Boolean(value));

  const detailsRows = [...essentialRows, ...technicalRows];
  const heroStats = [
    vehicle.mileage !== null
      ? {
          icon: Gauge,
          label: "Kilométrage",
          value: `${formatNumber(vehicle.mileage)} km`,
        }
      : null,
    vehicle.isNew
      ? { icon: BadgeCheck, label: "État", value: "Neuf" }
      : { icon: BadgeCheck, label: "État", value: "Occasion" },
    vehicle.fuelType
      ? { icon: Fuel, label: "Carburant", value: vehicle.fuelType.toLowerCase() }
      : null,
    vehicle.transmission
      ? {
          icon: Settings,
          label: "Transmission",
          value: vehicle.transmission.toLowerCase(),
        }
      : null,
  ].filter(
    (stat): stat is { icon: LucideIcon; label: string; value: string } =>
      Boolean(stat),
  );
  const overviewItems = [
    vehicle.year ? { icon: Calendar, label: "Année", value: String(vehicle.year) } : null,
    vehicle.mileage !== null
      ? { icon: Gauge, label: "Kilométrage", value: `${formatNumber(vehicle.mileage)} km` }
      : null,
    vehicle.fuelType
      ? { icon: Fuel, label: "Carburant", value: vehicle.fuelType.toLowerCase() }
      : null,
    vehicle.transmission
      ? { icon: Settings, label: "Transmission", value: vehicle.transmission.toLowerCase() }
      : null,
    vehicle.seats ? { icon: Users, label: "Places", value: `${vehicle.seats}` } : null,
    vehicle.doors ? { icon: DoorOpen, label: "Portes", value: `${vehicle.doors}` } : null,
    color.name ? { icon: Palette, label: "Couleur", value: color.name } : null,
    vehicle.power ? { icon: CarFront, label: "Puissance", value: `${vehicle.power} CV` } : null,
  ].filter(
    (item): item is { icon: LucideIcon; label: string; value: string } =>
      Boolean(item),
  );

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#1b1b1b]">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />

      <PublicHeader brandLinks={brandLinks} settings={settings} sticky={false} />

      <section className="bg-[#f8f8f6] px-4 pb-6 pt-8 sm:px-8 lg:pt-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#1b1b1b]/60">
            <Link className="hover:text-[#1b1b1b]" href="/">
              Accueil
            </Link>
            <span>/</span>
            <span>{vehicleCategoryName}</span>
            <span>/</span>
            <span className="text-[#1b1b1b]">{vehicle.title}</span>
          </div>

          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-2">
                <span className={getVehicleStatusBadgeClassName(vehicle.status as PublicVehicleStatus)}>
                  {getVehicleStatusLabel(vehicle.status as PublicVehicleStatus)}
                </span>
                {vehicle.isNew ? (
                  <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1b1b1b]">
                    Nouveau
                  </span>
                ) : null}
              </div>
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#111111] sm:text-5xl">
                {vehicle.title}
              </h1>
              <p className="mt-3 text-sm font-semibold text-[#1b1b1b]/58">
                {vehicle.brand.name} / {vehicleCategoryName}
                {vehicle.model ? ` / ${vehicle.model}` : ""}
                {vehicle.trim ? ` / ${vehicle.trim}` : ""}
              </p>
            </div>
            <div className="rounded-md border border-[#ececec] bg-white px-5 py-4 shadow-[0_12px_34px_rgba(20,24,29,0.06)] lg:min-w-72">
              <p className="text-xs font-semibold uppercase text-[#1b1b1b]/45">
                Prix
              </p>
              <p className="mt-1 text-3xl font-semibold text-[#111111]">
                {formatPrice(vehicle.price, vehicle.priceCurrency)}
              </p>
            </div>
          </div>

          {heroStats.length ? (
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {heroStats.map(({ icon: Icon, label, value }) => (
                <div
                  className="flex min-h-20 items-center gap-3 rounded-md border border-[#ececec] bg-white px-4 py-3 shadow-[0_10px_26px_rgba(20,24,29,0.04)]"
                  key={label}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#a21d2f]/10 text-[#a21d2f]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#1b1b1b]/45">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold capitalize text-[#111111]">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-[#f8f8f6] px-4 pb-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <VehicleGallery
            badges={[]}
            images={galleryImages}
            title={vehicle.title}
            videos={videos.map((video, index) => ({
              src: getPublicAssetUrl(video),
              title: `${vehicle.title} vidéo ${index + 1}`,
            }))}
          />
        </div>
      </section>

      <nav className="sticky top-0 z-40 border-y border-[#1b1b1b]/10 bg-white/95 px-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl gap-7 overflow-x-auto text-sm font-semibold text-[#1b1b1b]/62">
          <a className="min-h-14 shrink-0 content-center border-b-2 border-[#a21d2f] text-[#111111]" href="#overview">
            Apercu
          </a>
          <a className="min-h-14 shrink-0 content-center transition hover:text-[#a21d2f]" href="#specs">
            Specs et options
          </a>
          <a className="min-h-14 shrink-0 content-center transition hover:text-[#a21d2f]" href="#contact">
            Contact
          </a>
          {relatedVehicles.length ? (
            <a className="min-h-14 shrink-0 content-center transition hover:text-[#a21d2f]" href="#similar">
              Similaires
            </a>
          ) : null}
        </div>
      </nav>

      <section className="px-4 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            {vehicle.description ? (
              <article id="overview">
                <h2 className="text-2xl font-semibold text-[#111111]">Description</h2>
                <p className="mt-5 whitespace-pre-line text-sm leading-8 text-[#1b1b1b]/65">
                  {vehicle.description}
                </p>
              </article>
            ) : null}

            {overviewItems.length ? (
              <section className="mt-10" id="specs">
                <h2 className="text-2xl font-semibold text-[#111111]">Apercu du vehicule</h2>
                <div className="mt-5 grid overflow-hidden rounded-md border border-[#ececec] bg-white shadow-[0_10px_26px_rgba(20,24,29,0.04)] sm:grid-cols-2">
                  {overviewItems.map(({ icon: Icon, label, value }) => (
                    <div className="flex gap-3 border-b border-[#1b1b1b]/10 p-4 sm:odd:border-r" key={label}>
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#a21d2f]" />
                      <div>
                        <p className="text-xs font-semibold uppercase text-[#1b1b1b]/45">
                          {label}
                        </p>
                        <p className="mt-1 text-sm font-semibold capitalize text-[#111111]">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {vehicleOptions.length ? (
              <section className="mt-10">
                <h2 className="text-2xl font-semibold text-[#111111]">Options</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {vehicleOptions.map((option) => (
                    <li className="flex items-center gap-3 text-sm font-semibold text-[#1b1b1b]/76" key={option.id}>
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#a21d2f]" />
                      {option.name}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {detailsRows.length ? (
              <section className="mt-10">
                <h2 className="text-2xl font-semibold text-[#111111]">Fiche technique</h2>
                <div className="mt-5 grid rounded-md border border-[#ececec] bg-white shadow-[0_10px_26px_rgba(20,24,29,0.04)] sm:grid-cols-2">
                  {detailsRows.map(([label, value]) => (
                    <div className="flex items-center justify-between gap-5 border-b border-[#1b1b1b]/10 px-4 py-3 text-sm" key={label}>
                      <span className="font-semibold text-[#1b1b1b]/50">{label}</span>
                      <span className="text-right font-semibold capitalize text-[#111111]">{value}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-20 lg:self-start" id="contact">
            <div className="rounded-md border border-[#ececec] bg-white p-6 shadow-[0_18px_45px_rgba(20,24,29,0.08)]">
              <p className="text-3xl font-semibold text-[#111111]">
                {formatPrice(vehicle.price, vehicle.priceCurrency)}
              </p>
              <p className="mt-2 text-sm text-[#1b1b1b]/58">
                {vehicle.year || "Année non renseignée"}
                {firstRegistration ? ` / ${firstRegistration}` : ""}
              </p>
              <div className="mt-6 grid gap-3">
                <a
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#20b65a] px-5 text-sm font-semibold text-white transition hover:bg-[#168a43]"
                  href={whatsappUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
                <a
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#1b1b1b] px-5 text-sm font-semibold text-white transition hover:bg-[#a21d2f]"
                  href={phoneHref(settings.contactPhone)}
                >
                  <Phone className="h-4 w-4" />
                  Appeler
                </a>
                <a
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#1b1b1b]/15 px-5 text-sm font-semibold text-[#1b1b1b] transition hover:border-[#1b1b1b] hover:bg-[#1b1b1b] hover:text-white"
                  href={`mailto:${settings.contactEmail}?subject=${encodeURIComponent(
                    `Demande ${vehicle.title}`,
                  )}`}
                >
                  <Mail className="h-4 w-4" />
                  Contacter le showroom
                </a>
                {inspectionReportUrl ? (
                  <a
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#a21d2f] bg-[#a21d2f] px-5 text-sm font-semibold text-white transition hover:border-[#1b1b1b] hover:bg-[#1b1b1b]"
                    href={inspectionReportUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <FileText className="h-4 w-4" />
                    Rapport d&apos;inspection
                  </a>
                ) : null}
              </div>
            </div>

            <div className="mt-5 rounded-md border border-[#ececec] bg-white p-6 shadow-[0_10px_26px_rgba(20,24,29,0.04)]">
              <h3 className="text-lg font-semibold text-[#111111]">Contacter le vendeur</h3>
              <div className="mt-5 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-md bg-[#a21d2f] text-sm font-semibold text-white">
                  ABN
                </span>
                <div>
                  <p className="font-semibold text-[#111111]">Abn Motors</p>
                  <p className="text-sm font-semibold text-[#1b1b1b]/52">Vendeur verifie</p>
                </div>
              </div>
              <div className="mt-5 flex items-start gap-3 text-sm leading-6 text-[#1b1b1b]/62">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#a21d2f]" />
                <span>{settings.contactEmail}</span>
              </div>
            </div>

            {relatedVehicles.length ? (
              <div className="mt-5 rounded-md border border-[#ececec] bg-white p-6 shadow-[0_10px_26px_rgba(20,24,29,0.04)]">
                <h3 className="text-lg font-semibold text-[#111111]">Vehicules similaires</h3>
                <p className="mt-1 text-sm text-[#1b1b1b]/55">
                  Véhicules similaires que vous pourriez aimer
                </p>
                <div className="mt-5 grid gap-4">
                  {relatedVehicles.map((item) => {
                    const relatedImage = getImages(item.images)[0];

                    return (
                      <Link className="group grid grid-cols-[88px_1fr] gap-3" href={`/vehicules/${item.slug}`} key={item.id}>
                        <span className="relative h-20 overflow-hidden rounded-md bg-[#f8f8f6]">
                          <Image
                            alt={item.title}
                            className="object-cover transition group-hover:scale-105"
                            fill
                            loading="lazy"
                            sizes="88px"
                            src={relatedImage ? getMediaUrl(relatedImage) : "/showroom-hero.png"}
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-sm font-semibold leading-5 text-[#111111] group-hover:text-[#a21d2f]">
                            {item.title}
                          </span>
                          <span className="mt-2 block text-sm font-semibold text-[#a21d2f]">
                            {formatPrice(item.price, item.priceCurrency)}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
      {relatedVehicles.length ? (
        <section className="px-4 pb-16 sm:px-8" id="similar">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-semibold">Véhicules similaires</h2>
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {relatedVehicles.map((item) => {
                const relatedImage = getImages(item.images)[0];

                return (
                  <Link
                    className="group overflow-hidden rounded-md border border-[#ececec] bg-white shadow-[0_10px_28px_rgba(20,24,29,0.05)] transition hover:-translate-y-1 hover:border-[#a21d2f]/35 hover:shadow-[0_18px_42px_rgba(20,24,29,0.1)]"
                    href={`/vehicules/${item.slug}`}
                    key={item.id}
                  >
                    <div className="relative h-52 bg-white">
                      <Image
                        alt={item.title}
                        className="object-cover transition duration-300 group-hover:scale-105"
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        src={relatedImage ? getMediaUrl(relatedImage) : "/showroom-hero.png"}
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold text-[#1b1b1b]/45">
                        {item.brand.name} / {item.category?.name || "Non classé"}
                      </p>
                      <h3 className="mt-2 font-semibold">{item.title}</h3>
                      <p className="mt-4 font-semibold">
                        {formatPrice(item.price, item.priceCurrency)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
