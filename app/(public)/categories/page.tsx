import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { PublicHeader } from "../_components/public-header";
import { CategoriesBrowser } from "./categories-browser";
import { getMediaUrl } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";
import { getPublicBrandLinks } from "@/lib/public-navigation";
import { getShowroomSettings } from "@/lib/settings";

export const revalidate = 300;

export const metadata: Metadata = {
  description:
    "Parcourez les categories de vehicules disponibles chez AutoPro Korea.",
  title: "Categories | AutoPro Korea",
};

type CategoryCard = {
  description: string | null;
  icon: string | null;
  id: string;
  image: string | null;
  name: string;
  slug: string;
  _count: { vehicles: number };
};

async function getCategories(): Promise<CategoryCard[]> {
  try {
    const prisma = getPrisma();
    const categories = await prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        description: true,
        icon: true,
        id: true,
        image: true,
        name: true,
        slug: true,
        _count: { select: { vehicles: true } },
      },
      where: { isActive: true, showOnCategoriesPage: true },
    });

    return categories.map((category) => ({
      ...category,
      image: category.image ? getMediaUrl(category.image) : null,
    }));
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const [categories, settings, brandLinks] = await Promise.all([
    getCategories(),
    getShowroomSettings(),
    getPublicBrandLinks(),
  ]);
  const totalVehicles = categories.reduce(
    (total, category) => total + category._count.vehicles,
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
              <span className="text-white">Categories</span>
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-6xl">
              Parcourir par type
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
              Retrouvez les styles de carrosserie disponibles et accedez
              rapidement aux vehicules qui correspondent a votre recherche.
            </p>
          </div>
        </div>
      </section>
      <section className="px-4 py-14 sm:px-8 lg:py-18">
        <CategoriesBrowser categories={categories} totalVehicles={totalVehicles} />
      </section>
    </main>
  );
}
