import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
import {
  ArrowLeft,
  BadgeCheck,
  CarFront,
  Grid2X2,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { PublicHeader } from "../../_components/public-header";
import {
  BrandVehicleFilter,
  type BrandFilterVehicle,
} from "./brand-vehicle-filter";
import { getMediaUrl } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";
import { getPublicBrandLinks } from "@/lib/public-navigation";
import { getShowroomSettings } from "@/lib/settings";

export const revalidate = 300;

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

type BrandVehicle = {
  brand: { name: string };
  category: { name: string } | null;
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
  status: "DISPONIBLE" | "VENDU" | "RESERVE";
  title: string;
  transmission: string | null;
  year: number | null;
};

const statusLabels = {
  DISPONIBLE: "Disponible",
  RESERVE: "Reserve",
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

function formatFuel(value: BrandVehicle["fuelType"]) {
  if (!value) return null;

  const labels = {
    DIESEL: "Diesel",
    ELECTRIQUE: "Electrique",
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

function toFilterVehicle(vehicle: BrandVehicle): BrandFilterVehicle {
  return {
    brandName: vehicle.brand.name,
    categoryName: vehicle.category?.name || "Non classe",
    fuel: formatFuel(vehicle.fuelType),
    id: vehicle.id,
    image: vehicleImage(vehicle) || null,
    mileage: vehicle.mileage,
    model: vehicle.model || vehicle.title,
    priceLabel: formatPrice(vehicle.price, vehicle.priceCurrency),
    slug: vehicle.slug,
    status: vehicle.status,
    statusLabel: statusLabels[vehicle.status],
    title: vehicle.title,
    transmission: formatTransmission(vehicle.transmission),
    year: vehicle.year,
  };
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
    select: {
      logo: true,
      name: true,
      vehicles: {
        select: {
          brand: { select: { name: true } },
          category: { select: { name: true } },
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

export async function generateStaticParams() {
  const prisma = getPrisma();

  const brands = await prisma.brand.findMany({
    select: { slug: true },
    where: {
      isActive: true,
      vehicles: {
        some: { status: { not: "BROUILLON" } },
      },
    },
  });

  return brands.map((brand) => ({ slug: brand.slug }));
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
    description: `Decouvrez les vehicules ${brand.name} disponibles, reserves et vendus dans le showroom AutoPro Korea.`,
    title: `${brand.name} | Vehicules par marque | AutoPro Korea`,
  };
}

export default async function BrandVehiclesPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const [brand, settings, brandLinks] = await Promise.all([
    getBrand(slug),
    getShowroomSettings(),
    getPublicBrandLinks(),
  ]);

  if (!brand) {
    notFound();
  }

  const vehicles = sortVehiclesByStatus(brand.vehicles as BrandVehicle[]);
  const filterVehicles = vehicles.map(toFilterVehicle);
  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "DISPONIBLE",
  ).length;
  const reservedVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "RESERVE",
  ).length;
  const soldVehicles = vehicles.filter((vehicle) => vehicle.status === "VENDU")
    .length;

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#24272c]">
      <PublicHeader brandLinks={brandLinks} settings={settings} sticky={false} />

      <section className="relative overflow-hidden bg-[#17191d] px-4 py-16 text-white sm:px-8 lg:py-24">
        <Image
          alt=""
          className="object-cover opacity-25"
          fill
          priority
          sizes="100vw"
          src="/showroom-hero.png"
        />
        <span className="absolute inset-0 bg-gradient-to-r from-[#17191d] via-[#17191d]/88 to-[#17191d]/54" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
              <Link className="text-white/75 transition hover:text-white" href="/">
                Accueil
              </Link>
              <span className="h-1 w-1 rounded-full bg-[#a21d2f]" />
              <Link
                className="text-white/75 transition hover:text-white"
                href="/marques"
              >
                Marques
              </Link>
              <span className="h-1 w-1 rounded-full bg-[#a21d2f]" />
              <span className="text-white">{brand.name}</span>
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-6xl">
              Voitures {brand.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
              Retrouvez les vehicules {brand.name} disponibles, reserves et
              vendus dans le showroom AutoPro Korea.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-8 lg:py-18">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-md border border-[#e3e4e1] bg-white p-6 shadow-[0_12px_34px_rgba(20,24,29,0.06)] lg:sticky lg:top-6">
            <Link
              className="inline-flex items-center gap-2 text-sm font-bold text-[#a21d2f]"
              href="/marques"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux marques
            </Link>

            <div className="mt-6 border-b border-[#e3e4e1] pb-5">
              <div className="grid h-24 place-items-center rounded-md border border-[#e3e4e1] bg-[#f8f8f6] px-6 py-4">
                {brand.logo ? (
                  <Image
                    alt={brand.name}
                    className="max-h-14 w-full object-contain"
                    height={70}
                    src={getMediaUrl(brand.logo)}
                    width={160}
                  />
                ) : (
                  <CarFront className="h-9 w-9 text-[#24272c]" />
                )}
              </div>
              <h2 className="mt-5 text-xl font-bold">{brand.name}</h2>
            </div>

            <div className="mt-6 space-y-6">
              <label className="block">
                <span className="text-sm font-bold text-[#24272c]">
                  Recherche
                </span>
                <span className="mt-3 flex h-12 items-center gap-3 rounded-md border border-[#e3e4e1] bg-[#f8f8f6] px-4 text-sm text-[#6f7378]">
                  <Search className="h-4 w-4 text-[#a21d2f]" />
                  Modele {brand.name}
                </span>
              </label>

              <div>
                <p className="text-sm font-bold text-[#24272c]">Statut</p>
                <div className="mt-3 space-y-2">
                  <StatusCount label="Disponibles" value={availableVehicles} />
                  <StatusCount label="Reserves" value={reservedVehicles} />
                  <StatusCount label="Vendus" value={soldVehicles} />
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-[#24272c]">Vehicules</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-[#6f7378]">
                    <span>0</span>
                    <span>{vehicles.length}+</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e3e4e1]">
                    <div className="h-full w-2/3 rounded-full bg-[#a21d2f]" />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-md border border-[#e3e4e1] bg-white px-5 py-4 shadow-[0_10px_26px_rgba(20,24,29,0.04)]">
              <p className="text-sm font-semibold text-[#6f7378]">
                Affichage de{" "}
                <span className="font-bold text-[#24272c]">
                  {vehicles.length}
                </span>{" "}
                vehicules
              </p>
              <div className="flex items-center gap-3">
                <span className="hidden text-sm font-semibold text-[#6f7378] sm:inline">
                  Trier par statut
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-md border border-[#a21d2f] bg-[#a21d2f] text-white">
                  <Grid2X2 className="h-5 w-5" />
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-md border border-[#e3e4e1] bg-white text-[#24272c]">
                  <SlidersHorizontal className="h-5 w-5" />
                </span>
              </div>
            </div>

            {vehicles.length ? (
              <BrandVehicleFilter
                emptyTitle="Aucun vehicule pour ces filtres"
                vehicles={filterVehicles}
              />
            ) : (
              <div className="border border-dashed border-[#cfd1cd] bg-white p-10 text-center">
                <BadgeCheck className="mx-auto h-9 w-9 text-[#a21d2f]" />
                <h2 className="mt-4 text-xl font-bold">
                  Aucun vehicule visible pour cette marque
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#6f7378]">
                  Les vehicules publies depuis le backoffice apparaitront ici
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

function StatusCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-[#e3e4e1] bg-white px-4 py-3 text-sm font-semibold text-[#4f545a]">
      <span>{label}</span>
      <span className="text-xs text-[#8b9096]">{value}</span>
    </div>
  );
}
