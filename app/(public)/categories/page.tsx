import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Car,
  CarFront,
  Gauge,
  Mountain,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PublicHeader } from "../_components/public-header";
import { getMediaUrl } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";
import { getShowroomSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

type CategoryCard = {
  description: string | null;
  icon: string | null;
  id: string;
  image: string | null;
  name: string;
  slug: string;
  _count: {
    vehicles: number;
  };
};

const iconMap: Record<string, LucideIcon> = {
  "badge-check": BadgeCheck,
  "car-front": CarFront,
  car: Car,
  gauge: Gauge,
  mountain: Mountain,
  sparkles: Sparkles,
  suv: Truck,
  truck: Truck,
  users: Users,
  wagon: CarFront,
};

async function getCategories() {
  try {
    const prisma = getPrisma();

    return await prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        description: true,
        icon: true,
        id: true,
        image: true,
        name: true,
        slug: true,
        _count: {
          select: { vehicles: true },
        },
      },
      where: {
        isActive: true,
        showOnCategoriesPage: true,
      },
    });
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getShowroomSettings(),
  ]);

  return (
    <main className="min-h-screen bg-white text-[#1b1b1b]">
      <PublicHeader settings={settings} sticky={false} />

      <section className="px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase text-[#1b1b1b]/45">
                Catégories
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
                Parcourir par type
              </h1>
            </div>
            <Link
              className="inline-flex rounded-full bg-[#1b1b1b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ffc10a] hover:text-[#1b1b1b]"
              href="/#inventory"
            >
              Voir les véhicules
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <CategoryTile category={category} key={category.id} />
            ))}
          </div>

          {!categories.length ? (
            <div className="mt-10 rounded-md border border-dashed border-[#1b1b1b]/15 bg-white p-10 text-center">
              <h2 className="text-xl font-semibold">Aucune catégorie visible</h2>
              <p className="mt-3 text-sm leading-7 text-[#1b1b1b]/62">
                Les catégories activées pour cette page apparaîtront ici.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function CategoryTile({ category }: { category: CategoryCard }) {
  const Icon = iconMap[category.icon || "car"] ?? Car;
  const imageUrl = category.image ? getMediaUrl(category.image) : "/showroom-hero.png";

  return (
    <Link
      className="group overflow-hidden rounded-md border border-[#1b1b1b]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1b1b1b]/10"
      href="/#inventory"
      id={category.slug}
      title={category.description || category.name}
    >
      <div className="relative h-60 bg-[#f4f4f1]">
        <Image
          alt={category.name}
          className="object-cover transition duration-500 group-hover:scale-105"
          fill
          sizes="(max-width: 1280px) 50vw, 33vw"
          src={imageUrl}
        />
        <span className="absolute inset-0 bg-gradient-to-t from-[#1b1b1b]/35 via-transparent to-transparent" />
        <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1b1b1b] shadow-lg shadow-[#1b1b1b]/10">
          <Icon className="h-5 w-5" />
          {category.name}
        </span>
      </div>
      <div className="p-5">
        <p className="text-sm leading-7 text-[#1b1b1b]/62">
          {category.description || "Catégorie disponible dans le showroom."}
        </p>
        <p className="mt-4 text-xs font-semibold uppercase text-[#1b1b1b]/45">
          {category._count.vehicles} véhicule
          {category._count.vehicles > 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}
