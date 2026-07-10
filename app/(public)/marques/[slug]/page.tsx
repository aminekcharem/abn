import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
import { ArrowLeft, BadgeCheck } from "lucide-react";

import { PublicHeader } from "../../_components/public-header";
import {
  BrandVehicleFilter,
  type BrandFilterVehicle,
} from "./brand-vehicle-filter";
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

function toFilterVehicle(vehicle: BrandVehicle): BrandFilterVehicle {
  return {
    brandName: vehicle.brand.name,
    categoryName: vehicle.category?.name || "Non classé",
    fuel: formatFuel(vehicle.fuelType),
    id: vehicle.id,
    image: vehicleImage(vehicle) || null,
    mileage: vehicle.mileage,
    model: vehicle.model || vehicle.title,
    priceLabel: formatPrice(vehicle.price, vehicle.priceCurrency),
    slug: vehicle.slug,
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
    description: `Découvrez les véhicules ${brand.name} disponibles, réservés et vendus dans le showroom AutoPro Korea.`,
    title: `${brand.name} | Véhicules par marque | AutoPro Korea`,
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

  return (
    <main className="min-h-screen bg-white text-[#1b1b1b]">
      <PublicHeader brandLinks={brandLinks} settings={settings} sticky={false} />

      <section className="px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1b1b1b]/62 transition hover:text-[#1b1b1b]"
            href="/marques"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux marques
          </Link>

          {/*
                Les véhicules sont classés par statut : disponibles d&apos;abord,
                puis réservés, puis vendus.
          */}
          <div className="mt-8">
            {vehicles.length ? (
              <BrandVehicleFilter
                emptyTitle="Aucun véhicule pour ces filtres"
                vehicles={filterVehicles}
              />
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
