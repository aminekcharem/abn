import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
import { ArrowLeft, BadgeCheck, CalendarDays, Fuel, Gauge, Heart } from "lucide-react";

import { PublicHeader } from "../../_components/public-header";
import { getMediaUrl } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";
import { getShowroomSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

type BrandVehicle = {
  brand: { name: string };
  category: { name: string };
  fuelType: "ESSENCE" | "DIESEL" | "HYBRIDE" | "ELECTRIQUE" | null;
  id: string;
  images: Prisma.JsonValue;
  isFeatured: boolean;
  isNew: boolean;
  mileage: number | null;
  price: Prisma.Decimal | number;
  priceCurrency: "TND" | "EUR";
  slug: string;
  status: "DISPONIBLE" | "VENDU" | "RESERVE";
  title: string;
  transmission: string | null;
  year: number | null;
};

const statusLabels = {
  DISPONIBLE: "Disponible",
  RESERVE: "Réservé",
  VENDU: "Vendu",
} as const;

const statusOrder = {
  DISPONIBLE: 0,
  RESERVE: 1,
  VENDU: 2,
} as const;

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

function formatFuel(value: BrandVehicle["fuelType"]) {
  if (!value) return null;

  const labels = {
    DIESEL: "Diesel",
    ELECTRIQUE: "Électrique",
    ESSENCE: "Essence",
    HYBRIDE: "Hybride",
  };

  return labels[value];
}

function formatTransmission(value: BrandVehicle["transmission"]) {
  if (!value) return null;
  if (value !== "AUTOMATIQUE" && value !== "MANUELLE") return value;

  return value === "AUTOMATIQUE" ? "Automatique" : "Manuelle";
}

function vehicleImage(vehicle: BrandVehicle) {
  return getImages(vehicle.images)[0];
}

function sortVehiclesByStatus(vehicles: BrandVehicle[]) {
  return [...vehicles].sort((first, second) => {
    const statusDiff = statusOrder[first.status] - statusOrder[second.status];

    if (statusDiff !== 0) return statusDiff;

    return (second.year ?? 0) - (first.year ?? 0);
  });
}

async function getBrand(slug: string) {
  const prisma = getPrisma();

  return prisma.brand.findFirst({
    include: {
      vehicles: {
        include: {
          brand: { select: { name: true } },
          category: { select: { name: true } },
        },
        orderBy: [{ createdAt: "desc" }],
        where: { status: { not: "BROUILLON" } },
      },
    },
    where: {
      isActive: true,
      slug,
    },
  });
}

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);

  if (!brand) {
    return {
      title: "Marque introuvable | AutoPro Korea",
    };
  }

  return {
    description: `Découvrez les véhicules ${brand.name} disponibles, réservés et vendus dans le showroom AutoPro Korea.`,
    title: `${brand.name} | Véhicules par marque | AutoPro Korea`,
  };
}

export default async function BrandVehiclesPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const [brand, settings] = await Promise.all([
    getBrand(slug),
    getShowroomSettings(),
  ]);

  if (!brand) {
    notFound();
  }

  const vehicles = sortVehiclesByStatus(brand.vehicles as BrandVehicle[]);
  const counts = vehicles.reduce(
    (totals, vehicle) => ({
      ...totals,
      [vehicle.status]: totals[vehicle.status] + 1,
    }),
    { DISPONIBLE: 0, RESERVE: 0, VENDU: 0 },
  );

  return (
    <main className="min-h-screen bg-white text-[#1b1b1b]">
      <PublicHeader settings={settings} sticky={false} />

      <section className="px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1b1b1b]/62 transition hover:text-[#1b1b1b]"
            href="/marques"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux marques
          </Link>

          <div className="mt-8 grid gap-8 rounded-md bg-[#1b1b1b] p-7 text-white md:grid-cols-[0.7fr_1.3fr] md:p-10">
            <div>
              <p className="text-sm font-semibold uppercase text-white/45">
                Marque
              </p>
              <div className="mt-4 flex items-center gap-4">
                {brand.logo ? (
                  <span className="grid h-16 w-16 place-items-center rounded-md bg-white p-3">
                    <Image
                      alt=""
                      className="h-full w-full object-contain"
                      height={64}
                      src={getMediaUrl(brand.logo)}
                      width={64}
                    />
                  </span>
                ) : null}
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  {brand.name}
                </h1>
              </div>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/62">
                Les véhicules sont classés par statut : disponibles d&apos;abord,
                puis réservés, puis vendus.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {Object.entries(statusLabels).map(([status, label]) => (
                <div
                  className="rounded-md bg-white px-5 py-4 text-[#1b1b1b]"
                  key={status}
                >
                  <p className="text-2xl font-semibold">
                    {counts[status as keyof typeof counts]}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase text-[#1b1b1b]/45">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            {vehicles.length ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-[#1b1b1b]/15 bg-white p-10 text-center">
                <BadgeCheck className="mx-auto h-9 w-9 text-[#ffc10a]" />
                <h2 className="mt-4 text-xl font-semibold">
                  Aucun véhicule visible pour cette marque
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#1b1b1b]/62">
                  Les véhicules publiés depuis le backoffice apparaîtront ici
                  automatiquement.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function VehicleCard({ vehicle }: { vehicle: BrandVehicle }) {
  const image = vehicleImage(vehicle);
  const specs = [
    vehicle.year ? { icon: CalendarDays, label: String(vehicle.year) } : null,
    vehicle.mileage !== null
      ? { icon: Gauge, label: `${formatNumber(vehicle.mileage)} km` }
      : null,
    formatFuel(vehicle.fuelType)
      ? { icon: Fuel, label: formatFuel(vehicle.fuelType) as string }
      : null,
  ].filter(
    (spec): spec is { icon: typeof CalendarDays; label: string } => Boolean(spec),
  );

  return (
    <article className="group overflow-hidden rounded-md border border-[#1b1b1b]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1b1b1b]/10">
      <Link className="block" href={`/vehicles/${vehicle.slug}`}>
        <div className="relative h-56 overflow-hidden bg-white">
          <Image
            alt={vehicle.title}
            className="object-cover transition duration-300 group-hover:scale-105"
            fill
            sizes="(max-width: 1280px) 50vw, 33vw"
            src={image ? getMediaUrl(image) : "/showroom-hero.png"}
          />
          <span className="absolute left-4 top-4 rounded-full bg-[#ffc10a] px-3 py-1 text-xs font-semibold text-[#1b1b1b]">
            {statusLabels[vehicle.status]}
          </span>
          <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white text-[#1b1b1b]">
            <Heart className="h-4 w-4" />
          </span>
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold text-[#1b1b1b]/45">
            {vehicle.brand.name} / {vehicle.category.name}
          </p>
          <h2 className="mt-2 line-clamp-1 font-semibold">{vehicle.title}</h2>
          <p className="mt-2 text-xs leading-5 text-[#1b1b1b]/60">
            {vehicle.year
              ? `Modèle ${vehicle.year} dans le stock du showroom.`
              : "Véhicule visible dans le stock du showroom."}
          </p>

          {specs.length ? (
            <div className="mt-4 grid grid-cols-3 gap-2 border-y border-[#1b1b1b]/10 py-3 text-center text-[11px] text-[#1b1b1b]/62">
              {specs.map(({ icon: Icon, label }) => (
                <span
                  className="flex min-w-0 items-center justify-center gap-1"
                  key={label}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </span>
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
          {formatTransmission(vehicle.transmission) ? (
            <p className="mt-3 text-xs text-[#1b1b1b]/50">
              {formatTransmission(vehicle.transmission)}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
