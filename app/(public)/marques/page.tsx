import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  Grid2X2,
  Images,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { PublicHeader } from "../_components/public-header";
import { getMediaUrl } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";
import { getPublicBrandLinks } from "@/lib/public-navigation";
import { getShowroomSettings } from "@/lib/settings";

export const revalidate = 300;

export const metadata: Metadata = {
  description:
    "Parcourez les marques disponibles chez AutoPro Korea et accedez aux vehicules publies pour chaque marque.",
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
  const totalVehicles = brands.reduce(
    (total, brand) => total + brand._count.vehicles,
    0,
  );

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
              <span className="text-white">Marques</span>
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-6xl">
              Voitures par marque
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
              Explorez les constructeurs actifs et accedez rapidement aux
              vehicules publies pour chaque marque.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-8 lg:py-18">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-md border border-[#e3e4e1] bg-white p-6 shadow-[0_12px_34px_rgba(20,24,29,0.06)] lg:sticky lg:top-6">
            <div className="flex items-center justify-between gap-4 border-b border-[#e3e4e1] pb-5">
              <h2 className="text-xl font-bold">Filtres et tri</h2>
              <Link className="text-sm font-bold text-[#a21d2f]" href="/marques">
                Effacer
              </Link>
            </div>

            <div className="mt-6 space-y-6">
              <label className="block">
                <span className="text-sm font-bold text-[#24272c]">
                  Recherche
                </span>
                <span className="mt-3 flex h-12 items-center gap-3 rounded-md border border-[#e3e4e1] bg-[#f8f8f6] px-4 text-sm text-[#6f7378]">
                  <Search className="h-4 w-4 text-[#a21d2f]" />
                  Marque de vehicule
                </span>
              </label>

              <div>
                <p className="text-sm font-bold text-[#24272c]">Marques</p>
                <div className="mt-3 space-y-2">
                  {brands.slice(0, 7).map((brand) => (
                    <Link
                      className="flex items-center justify-between gap-3 rounded-md border border-[#e3e4e1] bg-white px-4 py-3 text-sm font-semibold text-[#4f545a] transition hover:border-[#a21d2f] hover:text-[#a21d2f]"
                      href={`#${brand.slug}`}
                      key={brand.id}
                    >
                      <span>{brand.name}</span>
                      <span className="text-xs text-[#8b9096]">
                        {brand._count.vehicles}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-[#24272c]">Vehicules</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-[#6f7378]">
                    <span>0</span>
                    <span>{totalVehicles}+</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e3e4e1]">
                    <div className="h-full w-2/3 rounded-full bg-[#a21d2f]" />
                  </div>
                </div>
              </div>

              <Link
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#a21d2f] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#111111]"
                href="/#vehicules"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Voir les vehicules
              </Link>
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-[#e3e4e1] bg-white px-5 py-4 shadow-[0_10px_26px_rgba(20,24,29,0.04)]">
              <p className="text-sm font-semibold text-[#6f7378]">
                Affichage de{" "}
                <span className="font-bold text-[#24272c]">
                  {brands.length}
                </span>{" "}
                marques
              </p>
              <div className="flex items-center gap-3">
                <span className="hidden text-sm font-semibold text-[#6f7378] sm:inline">
                  Trier par popularite
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-md border border-[#a21d2f] bg-[#a21d2f] text-white">
                  <Grid2X2 className="h-5 w-5" />
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-md border border-[#e3e4e1] bg-white text-[#24272c]">
                  <SlidersHorizontal className="h-5 w-5" />
                </span>
              </div>
            </div>

            {brands.length ? (
              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {brands.map((brand) => (
                  <BrandTile brand={brand} key={brand.id} />
                ))}
              </div>
            ) : (
              <div className="mt-6 border border-dashed border-[#cfd1cd] bg-white p-10 text-center">
                <BadgeCheck className="mx-auto h-9 w-9 text-[#a21d2f]" />
                <h2 className="mt-4 text-xl font-bold">
                  Aucune marque visible
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#6f7378]">
                  Les marques apparaitront ici des qu&apos;elles auront au moins
                  un vehicule publie.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function BrandTile({ brand }: { brand: BrandCard }) {
  const vehicleLabel = brand._count.vehicles > 1 ? "voitures" : "voiture";

  return (
    <Link
      className="group overflow-hidden rounded-md border border-[#e3e4e1] bg-white shadow-[0_10px_28px_rgba(20,24,29,0.05)] transition hover:-translate-y-1 hover:border-[#a21d2f]/50 hover:shadow-[0_20px_50px_rgba(36,39,44,0.12)]"
      href={`/marques/${brand.slug}`}
      id={brand.slug}
    >
      <div className="relative grid aspect-[1.35] place-items-center bg-[#ececea] px-8 py-8">
        <span className="absolute inset-0 bg-gradient-to-t from-[#111214]/16 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-md bg-[#a21d2f] px-3 py-1.5 text-xs font-bold uppercase text-white">
            Marque
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#24272c] px-3 py-1.5 text-xs font-bold text-white">
            <Images className="h-3.5 w-3.5" />
            {brand._count.vehicles}
          </span>
        </div>
        {brand.logo ? (
          <div className="relative z-10 grid h-28 w-full place-items-center rounded-md bg-white p-6 shadow-sm">
            <Image
              alt={brand.name}
              className="max-h-16 w-full object-contain transition duration-300 group-hover:scale-105"
              height={80}
              src={getMediaUrl(brand.logo)}
              width={180}
            />
          </div>
        ) : (
          <span className="relative z-10 grid h-20 w-20 place-items-center rounded-md bg-white text-[#24272c] shadow-sm ring-1 ring-[#e3e4e1] transition group-hover:bg-[#a21d2f] group-hover:text-white">
            <CarFront className="h-9 w-9" />
          </span>
        )}
      </div>

      <div className="p-5">
        <h2 className="text-xl font-bold leading-tight text-[#24272c] transition group-hover:text-[#a21d2f]">
          {brand.name}
        </h2>
        {brand.countryOrigin ? (
          <p className="mt-2 text-sm leading-7 text-[#6f7378]">
            {brand.countryOrigin}
          </p>
        ) : (
          <p className="mt-2 text-sm leading-7 text-[#6f7378]">
            Constructeur disponible dans le showroom.
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3 border-y border-[#e3e4e1] py-4 text-sm font-semibold text-[#6f7378]">
          <span className="inline-flex items-center gap-2">
            <CarFront className="h-4 w-4 text-[#a21d2f]" />
            Marque
          </span>
          <span className="inline-flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-[#a21d2f]" />
            Showroom
          </span>
          <span className="inline-flex items-center gap-2">
            <Grid2X2 className="h-4 w-4 text-[#a21d2f]" />
            Disponible
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-lg font-bold text-[#24272c]">
            {brand._count.vehicles} {vehicleLabel}
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#a21d2f]">
            Voir
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
