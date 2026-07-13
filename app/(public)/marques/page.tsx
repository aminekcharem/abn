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
          <div>
            <div>
              <p className="text-sm font-semibold uppercase text-[#1b1b1b]/45">
                Marques
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
                Toutes les marques disponibles
              </h1>
            </div>
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
      className="group flex min-h-60 flex-col rounded-md border border-[#e3e4e1] bg-[#f8f8f6] p-4 shadow-sm transition hover:-translate-y-1 hover:border-[#f2a414] hover:bg-white hover:shadow-[0_18px_45px_rgba(20,24,29,0.08)]"
      href={`/marques/${brand.slug}`}
    >
      <div className="grid h-28 place-items-center rounded-md border border-[#e3e4e1] bg-white px-6 py-4">
        {brand.logo ? (
          <Image
            alt={brand.name}
            className="max-h-16 w-full object-contain transition duration-300 group-hover:scale-105"
            height={80}
            src={getMediaUrl(brand.logo)}
            width={160}
          />
        ) : (
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[#f8f8f6] text-[#1b1b1b] ring-1 ring-[#e3e4e1]">
            <CarFront className="h-7 w-7" />
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-lg font-semibold">{brand.name}</p>
        {brand.countryOrigin ? (
          <p className="mt-1 text-sm text-[#1b1b1b]/50">
            {brand.countryOrigin}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="text-xs font-semibold uppercase text-[#1b1b1b]/45">
            {brand._count.vehicles} {vehicleLabel}
          </p>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#1b1b1b] ring-1 ring-[#e3e4e1] transition group-hover:bg-[#1b1b1b] group-hover:text-white group-hover:ring-[#1b1b1b]">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
