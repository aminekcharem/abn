import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, CarFront } from "lucide-react";

import { PublicHeader } from "../_components/public-header";
import { getMediaUrl } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";
import { getPublicBrandLinks } from "@/lib/public-navigation";
import { getShowroomSettings } from "@/lib/settings";

export const revalidate = 300;

export const metadata: Metadata = {
  description:
    "Parcourez les marques disponibles chez AutoPro Korea et accédez aux véhicules publiés pour chaque marque.",
  title: "Marques | AutoPro Korea",
};

type BrandCard = {
  countryOrigin: string | null;
  id: string;
  logo: string | null;
  name: string;
  slug: string;
  _count: {
    vehicles: number;
  };
};

async function getBrands() {
  try {
    const prisma = getPrisma();

    return await prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: {
        countryOrigin: true,
        id: true,
        logo: true,
        name: true,
        slug: true,
        _count: {
          select: {
            vehicles: {
              where: { status: { not: "BROUILLON" } },
            },
          },
        },
      },
      where: {
        isActive: true,
        vehicles: {
          some: { status: { not: "BROUILLON" } },
        },
      },
    });
  } catch {
    return [];
  }
}

export default async function BrandsPage() {
  const [brands, settings, brandLinks] = await Promise.all([
    getBrands(),
    getShowroomSettings(),
    getPublicBrandLinks(),
  ]);

  return (
    <main className="min-h-screen bg-white text-[#1b1b1b]">
      <PublicHeader brandLinks={brandLinks} settings={settings} sticky={false} />

      <section className="px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase text-[#1b1b1b]/45">
                Marques
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
                Toutes les marques disponibles
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#1b1b1b]/62">
                Retrouvez uniquement les marques qui ont des véhicules publiés
                dans le showroom.
              </p>
            </div>
            <Link
              className="inline-flex rounded-full bg-[#1b1b1b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ffc10a] hover:text-[#1b1b1b]"
              href="/#inventory"
            >
              Voir les véhicules
            </Link>
          </div>

          {brands.length ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {brands.map((brand) => (
                <BrandTile brand={brand} key={brand.id} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-md border border-dashed border-[#1b1b1b]/15 bg-white p-10 text-center">
              <BadgeCheck className="mx-auto h-9 w-9 text-[#ffc10a]" />
              <h2 className="mt-4 text-xl font-semibold">
                Aucune marque visible
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#1b1b1b]/62">
                Les marques apparaîtront ici dès qu&apos;elles auront au moins un
                véhicule publié.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function BrandTile({ brand }: { brand: BrandCard }) {
  const vehicleLabel = brand._count.vehicles > 1 ? "voitures" : "voiture";

  return (
    <Link
      className="group flex min-h-72 flex-col rounded-md border border-[#1b1b1b]/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1b1b1b]/10"
      href={`/marques/${brand.slug}`}
    >
      <div className="grid aspect-[4/3] place-items-center rounded-md bg-[#f4f4f1] p-8">
        {brand.logo ? (
          <Image
            alt={brand.name}
            className="max-h-24 w-full object-contain transition duration-300 group-hover:scale-105"
            height={120}
            src={getMediaUrl(brand.logo)}
            width={180}
          />
        ) : (
          <span className="grid h-20 w-20 place-items-center rounded-full bg-white text-[#1b1b1b] shadow-sm">
            <CarFront className="h-9 w-9" />
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <p className="text-xl font-semibold">{brand.name}</p>
        {brand.countryOrigin ? (
          <p className="mt-1 text-sm text-[#1b1b1b]/50">
            {brand.countryOrigin}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <p className="text-xs font-semibold uppercase text-[#1b1b1b]/45">
            {brand._count.vehicles} {vehicleLabel}
          </p>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#1b1b1b] text-white transition group-hover:bg-[#ffc10a] group-hover:text-[#1b1b1b]">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
