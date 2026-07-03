import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import {
  CalendarDays,
  Car,
  Check,
  Fuel,
  Gauge,
  Mail,
  Palette,
  Phone,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { auth } from "@/auth";
import { getMediaUrl } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";
import { getShowroomSettings } from "@/lib/settings";
import { PublicHeader } from "../../_components/public-header";
import { VehicleGallery } from "./vehicle-gallery";

export const dynamic = "force-dynamic";

type VehiclePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ request?: string }>;
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
    include: {
      brand: true,
      category: true,
      options: {
        include: { category: true },
        orderBy: [{ category: { order: "asc" } }, { name: "asc" }],
      },
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
  searchParams,
}: VehiclePageProps) {
  const [{ slug }, query, session] = await Promise.all([
    params,
    searchParams,
    auth(),
  ]);
  const [vehicle, settings] = await Promise.all([
    getVehicle(slug, Boolean(session?.user)),
    getShowroomSettings(),
  ]);

  if (!vehicle) {
    notFound();
  }

  const vehicleId = vehicle.id;
  const vehicleSlug = vehicle.slug;
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
  const optionGroups = vehicle.options.reduce<
    Array<{ id: string; name: string; options: string[] }>
  >((groups, option) => {
    const existing = groups.find((group) => group.id === option.category.id);

    if (existing) {
      existing.options.push(option.name);
      return groups;
    }

    groups.push({
      id: option.category.id,
      name: option.category.name,
      options: [option.name],
    });

    return groups;
  }, []);

  const relatedVehicles = await getPrisma().vehicle.findMany({
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 3,
    where: {
      categoryId: vehicle.categoryId,
      id: { not: vehicle.id },
      status: { not: "BROUILLON" },
    },
  });

  async function createPurchaseRequest(formData: FormData) {
    "use server";

    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const financing = formData.get("financing") === "on";

    if (!fullName || !email) {
      redirect(`/vehicles/${vehicleSlug}?request=missing#request`);
    }

    await getPrisma().purchaseRequest.create({
      data: {
        email,
        financing,
        fullName,
        message: message || null,
        phone: phone || null,
        vehicleId,
      },
    });

    redirect(`/vehicles/${vehicleSlug}?request=sent#request`);
  }

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

  const specs: Array<[string, string, LucideIcon]> = [
    vehicle.year ? ["Année", String(vehicle.year), CalendarDays] : null,
    vehicle.mileage !== null
      ? ["Kilométrage", `${formatNumber(vehicle.mileage)} km`, Gauge]
      : null,
    vehicle.fuelType ? ["Carburant", vehicle.fuelType.toLowerCase(), Fuel] : null,
    vehicle.transmission
      ? ["Transmission", vehicle.transmission.toLowerCase(), Settings]
      : null,
    vehicle.power ? ["Puissance", `${vehicle.power} CV`, Wrench] : null,
    vehicle.seats ? ["Places", `${vehicle.seats} places`, Users] : null,
    vehicle.doors ? ["Portes", `${vehicle.doors} portes`, Car] : null,
    color.name ? ["Couleur", color.name, Palette] : null,
  ].filter((spec): spec is [string, string, LucideIcon] => Boolean(spec));

  const technicalRows = [
    ["Marque", vehicle.brand.name],
    ["Catégorie", vehicle.category.name],
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

  return (
    <main className="min-h-screen bg-white text-[#1b1b1b]">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />

      <PublicHeader settings={settings} sticky={false} />

      <section className="px-4 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#1b1b1b]/60">
            <Link className="hover:text-[#1b1b1b]" href="/">
              Accueil
            </Link>
            <span>/</span>
            <span>{vehicle.category.name}</span>
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
                src: getMediaUrl(video),
                title: `${vehicle.title} vidéo ${index + 1}`,
              }))}
            />

            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-md border border-[#1b1b1b]/10 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-[#1b1b1b]/55">
                  {vehicle.brand.name} / {vehicle.category.name}
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
                    className="inline-flex items-center justify-center rounded-full bg-[#ffc10a] px-5 py-3 text-sm font-semibold text-[#1b1b1b] transition hover:bg-[#1b1b1b] hover:text-white"
                    href="#request"
                  >
                    Demander ce véhicule
                  </a>
                  <a
                    className="inline-flex items-center justify-center rounded-full border border-[#1b1b1b]/15 px-5 py-3 text-sm font-semibold transition hover:border-[#1b1b1b] hover:bg-[#1b1b1b] hover:text-white"
                    href={`mailto:sales@autopro.test?subject=${encodeURIComponent(
                      `Demande ${vehicle.title}`,
                    )}`}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Contacter le showroom
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-8">
        <div className="mx-auto max-w-7xl rounded-md bg-[#f8f8f6] px-4 py-5 sm:px-5 sm:py-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#ffc10a]">Caractéristiques</p>
              <h2 className="mt-1 text-2xl font-semibold text-[#050b20]">
                Points essentiels
              </h2>
            </div>
            <span className="hidden h-px flex-1 bg-gradient-to-r from-[#ffc10a] via-[#050b20]/10 to-transparent md:block" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {specs.map(([label, value, Icon], index) => (
              <div
                className="vehicle-spec-card group relative min-h-32 overflow-hidden rounded-md border border-[#050b20]/10 bg-white p-5 shadow-[0_18px_45px_rgba(5,11,32,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#ffc10a]/70 hover:shadow-[0_26px_70px_rgba(5,11,32,0.12)]"
                key={label}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-md bg-[#ffc10a]/15 text-[#050b20] transition duration-300 group-hover:bg-[#ffc10a] group-hover:shadow-[0_14px_28px_rgba(255,193,10,0.28)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="h-2 w-2 rounded-full bg-[#ffc10a] opacity-40 transition duration-300 group-hover:scale-[2.4] group-hover:opacity-100" />
                  </div>
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase text-[#050b20]/45">
                      {label}
                    </p>
                    <p className="mt-1 text-lg font-semibold capitalize text-[#050b20]">
                      {value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {vehicle.description ? (
            <article>
              <p className="text-sm font-semibold text-[#ffc10a]">Description</p>
              <h2 className="mt-2 text-2xl font-semibold">Présentation du véhicule</h2>
              <p className="mt-5 whitespace-pre-line text-sm leading-8 text-[#1b1b1b]/65">
                {vehicle.description}
              </p>
            </article>
          ) : null}

          {technicalRows.length ? (
            <article>
              <p className="text-sm font-semibold text-[#ffc10a]">Détails</p>
              <h2 className="mt-2 text-2xl font-semibold">Fiche technique</h2>
              <div className="mt-5 grid overflow-hidden rounded-md border border-[#1b1b1b]/10 sm:grid-cols-2">
                {technicalRows.map(([label, value]) => (
                  <div
                    className="border-b border-[#1b1b1b]/10 p-4 last:border-b-0 sm:odd:border-r"
                    key={label}
                  >
                    <p className="text-xs font-semibold uppercase text-[#1b1b1b]/45">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </article>
          ) : null}
        </div>
      </section>

      {optionGroups.length ? (
        <section className="bg-white px-4 py-12 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#ffc10a]">Équipements</p>
                <h2 className="mt-2 text-2xl font-semibold">Options disponibles</h2>
              </div>
              <ShieldCheck className="hidden h-10 w-10 text-[#1b1b1b]/15 sm:block" />
            </div>
            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {optionGroups.map((group) => (
                <article className="rounded-md bg-white p-6 shadow-sm" key={group.id}>
                  <h3 className="font-semibold">{group.name}</h3>
                  <ul className="mt-5 grid gap-3 text-sm text-[#1b1b1b]/70">
                    {group.options.map((option) => (
                      <li className="flex items-center gap-3" key={option}>
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ffc10a] text-[#1b1b1b]">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        {option}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-4 py-12 sm:px-8" id="request">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-md bg-[#1b1b1b] p-6 text-white md:grid-cols-[0.75fr_1.25fr] md:p-10">
          <div>
            <Sparkles className="h-9 w-9 text-[#ffc10a]" />
            <h2 className="mt-5 text-2xl font-semibold">Demande d&apos;achat</h2>
            <p className="mt-4 text-sm leading-7 text-white/65">
              Envoyez votre intérêt pour ce véhicule. La demande sera disponible
              dans le backoffice pour suivi commercial.
            </p>
            {query?.request === "sent" ? (
              <p className="mt-5 rounded-md bg-emerald-400/15 px-4 py-3 text-sm font-semibold text-emerald-100">
                Votre demande a été envoyée.
              </p>
            ) : null}
            {query?.request === "missing" ? (
              <p className="mt-5 rounded-md bg-red-400/15 px-4 py-3 text-sm font-semibold text-red-100">
                Le nom et l&apos;e-mail sont obligatoires.
              </p>
            ) : null}
          </div>

          <form action={createPurchaseRequest} className="grid gap-4 sm:grid-cols-2">
            <input
              className="h-12 rounded-md border border-white/10 bg-white px-4 text-sm text-[#1b1b1b] outline-none"
              name="fullName"
              placeholder="Nom complet"
              required
            />
            <input
              className="h-12 rounded-md border border-white/10 bg-white px-4 text-sm text-[#1b1b1b] outline-none"
              name="email"
              placeholder="E-mail"
              required
              type="email"
            />
            <input
              className="h-12 rounded-md border border-white/10 bg-white px-4 text-sm text-[#1b1b1b] outline-none"
              name="phone"
              placeholder="Téléphone"
              type="tel"
            />
            <label className="flex h-12 items-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 text-sm font-semibold">
              <input className="h-4 w-4 accent-[#ffc10a]" name="financing" type="checkbox" />
              Besoin de financement
            </label>
            <textarea
              className="min-h-28 rounded-md border border-white/10 bg-white px-4 py-3 text-sm text-[#1b1b1b] outline-none sm:col-span-2"
              name="message"
              placeholder="Message"
            />
            <button
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#ffc10a] px-6 text-sm font-semibold text-[#1b1b1b] transition hover:bg-white sm:col-span-2"
              type="submit"
            >
              <Phone className="mr-2 h-4 w-4" />
              Envoyer la demande
            </button>
          </form>
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
                        unoptimized
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold text-[#1b1b1b]/45">
                        {item.brand.name} / {item.category.name}
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
