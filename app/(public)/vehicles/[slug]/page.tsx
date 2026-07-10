import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
import {
  FileText,
  Mail,
  Phone,
} from "lucide-react";

import { auth } from "@/auth";
import { getMediaUrl } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";
import { getPublicBrandLinks } from "@/lib/public-navigation";
import { getShowroomSettings } from "@/lib/settings";
import { PublicHeader } from "../../_components/public-header";
import { VehicleGallery } from "./vehicle-gallery";

export const dynamic = "force-dynamic";

type VehiclePageProps = {
  params: Promise<{ slug: string }>;
};

const statusLabels = {
  BROUILLON: "Brouillon",
  DISPONIBLE: "Disponible",
  RESERVE: "Réservé",
  VENDU: "Vendu",
} as const;

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

  return (
    <main className="min-h-screen bg-white text-[#1b1b1b]">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />

      <PublicHeader brandLinks={brandLinks} settings={settings} sticky={false} />

      <section className="px-4 py-8 sm:px-8 lg:py-10">
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

          <div className="mt-7 grid gap-7 lg:grid-cols-[1.35fr_0.65fr]">
            <VehicleGallery
              badges={[
                {
                  label: statusLabels[vehicle.status as keyof typeof statusLabels],
                  tone: "yellow",
                },
                ...(vehicle.isNew ? [{ label: "Nouveau", tone: "light" as const }] : []),
                ...(vehicle.isFeatured
                  ? [{ label: "Sélection", tone: "dark" as const }]
                  : []),
              ]}
              images={galleryImages}
              title={vehicle.title}
              videos={videos.map((video, index) => ({
                src: getPublicAssetUrl(video),
                title: `${vehicle.title} vidéo ${index + 1}`,
              }))}
            />

            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-md border border-[#1b1b1b]/10 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-[#1b1b1b]/55">
                  {vehicle.brand.name} / {vehicleCategoryName}
                </p>
                <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                  {vehicle.title}
                </h1>
                <p className="mt-3 text-sm text-[#1b1b1b]/60">
                  {vehicle.year || "Année non renseignée"}
                  {vehicle.model ? ` - ${vehicle.model}` : ""}
                  {vehicle.trim ? ` - ${vehicle.trim}` : ""}
                </p>
                <p className="mt-6 text-3xl font-semibold text-[#1b1b1b]">
                  {formatPrice(vehicle.price, vehicle.priceCurrency)}
                </p>

                <div className="mt-6 grid gap-3">
                  <a
                    className="inline-flex items-center justify-center rounded-full bg-[#20b65a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#168a43]"
                    href={whatsappUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Demander sur WhatsApp
                  </a>
                  <a
                    className="inline-flex items-center justify-center rounded-full border border-[#1b1b1b]/15 px-5 py-3 text-sm font-semibold transition hover:border-[#1b1b1b] hover:bg-[#1b1b1b] hover:text-white"
                    href={`mailto:${settings.contactEmail}?subject=${encodeURIComponent(
                      `Demande ${vehicle.title}`,
                    )}`}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Contacter le showroom
                  </a>
                  {inspectionReportUrl ? (
                    <a
                      className="inline-flex items-center justify-center rounded-full border border-[#ffc10a]/70 bg-[#ffc10a]/10 px-5 py-3 text-sm font-semibold text-[#1b1b1b] transition hover:bg-[#ffc10a]"
                      href={inspectionReportUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Rapport d&apos;inspection
                    </a>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {detailsRows.length ? (
        <section className="px-4 pb-10 sm:px-8">
        <div className="mx-auto max-w-7xl rounded-md bg-[#f8f8f6] px-4 py-5 sm:px-5 sm:py-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#ffc10a]">Caractéristiques</p>
              <h2 className="mt-1 text-2xl font-semibold text-[#050b20]">
                Points essentiels & fiche technique
              </h2>
            </div>
            <span className="hidden h-px flex-1 bg-gradient-to-r from-[#ffc10a] via-[#050b20]/10 to-transparent md:block" />
          </div>

          <div className="grid overflow-hidden rounded-md border border-[#050b20]/10 bg-white shadow-[0_18px_45px_rgba(5,11,32,0.06)] sm:grid-cols-2 lg:grid-cols-4">
            {detailsRows.map(([label, value]) => (
              <div
                className="border-b border-[#050b20]/10 p-4 last:border-b-0 sm:odd:border-r lg:border-r lg:[&:nth-child(4n)]:border-r-0"
                key={label}
              >
                <p className="text-xs font-semibold uppercase text-[#050b20]/45">
                  {label}
                </p>
                <p className="mt-1 text-sm font-semibold capitalize text-[#050b20]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
        </section>
      ) : null}

      {vehicleOptions.length ? (
        <section className="bg-white px-4 pb-10 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.06em] text-[#1b1b1b]">
              Équipements
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {vehicleOptions.map((option) => (
                <li
                  className="rounded-full border border-[#1b1b1b]/10 bg-[#f6f6f4] px-4 py-2 text-xs font-medium leading-none text-[#2f3338] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                  key={option.id}
                >
                  {option.name}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {vehicle.description ? (
            <article>
              <p className="text-sm font-semibold text-[#ffc10a]">Description</p>
              <h2 className="mt-2 text-2xl font-semibold">Présentation du véhicule</h2>
              <p className="mt-5 whitespace-pre-line text-sm leading-8 text-[#1b1b1b]/65">
                {vehicle.description}
              </p>
            </article>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#20b65a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#168a43]"
              href={whatsappUrl}
              rel="noreferrer"
              target="_blank"
            >
              Demander sur WhatsApp
            </a>
            <a
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#1b1b1b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#303030]"
              href={phoneHref(settings.contactPhone)}
            >
              <Phone className="mr-2 h-4 w-4" />
              Appeler
            </a>
            <a
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#1b1b1b]/15 px-5 py-3 text-sm font-semibold text-[#1b1b1b] transition hover:border-[#1b1b1b] hover:bg-[#1b1b1b] hover:text-white"
              href={`mailto:${settings.contactEmail}?subject=${encodeURIComponent(
                `Demande ${vehicle.title}`,
              )}`}
            >
              <Mail className="mr-2 h-4 w-4" />
              E-mail
            </a>
            {inspectionReportUrl ? (
              <a
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#f5a400] px-5 py-3 text-sm font-semibold text-[#1b1b1b] transition hover:bg-[#ffc10a]"
                href={inspectionReportUrl}
                rel="noreferrer"
                target="_blank"
              >
                <FileText className="mr-2 h-4 w-4" />
                Rapport d&apos;inspection
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {relatedVehicles.length ? (
        <section className="px-4 pb-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-semibold">Véhicules similaires</h2>
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {relatedVehicles.map((item) => {
                const relatedImage = getImages(item.images)[0];

                return (
                  <Link
                    className="group overflow-hidden rounded-md border border-[#1b1b1b]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    href={`/vehicles/${item.slug}`}
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
