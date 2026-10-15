"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Car,
  CarFront,
  Gauge,
  Grid2X2,
  Images,
  List,
  Mountain,
  Search,
  SlidersHorizontal,
  Sparkles,
  Truck,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

type CategoryCard = {
  description: string | null;
  icon: string | null;
  id: string;
  image: string | null;
  name: string;
  slug: string;
  _count: { vehicles: number };
};

type CategoriesBrowserProps = {
  categories: CategoryCard[];
  totalVehicles: number;
};

export function CategoriesBrowser({
  categories,
  totalVehicles,
}: CategoriesBrowserProps) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const filteredCategories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    if (!query) return categories;

    return categories.filter((category) =>
      [category.name, category.description, category.slug]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase("fr").includes(query)),
    );
  }, [categories, search]);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[300px_1fr]">
      <aside className="h-fit rounded-md border border-[#e3e4e1] bg-white p-6 shadow-[0_12px_34px_rgba(20,24,29,0.06)] lg:sticky lg:top-6">
        <div className="flex items-center justify-between gap-4 border-b border-[#e3e4e1] pb-5">
          <h2 className="text-xl font-bold">Filtres et tri</h2>
          <button
            className="text-sm font-bold text-[#a21d2f]"
            disabled={!search}
            onClick={() => setSearch("")}
            type="button"
          >
            Effacer
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <label className="block">
            <span className="text-sm font-bold text-[#24272c]">Recherche</span>
            <span className="mt-3 flex h-12 items-center gap-3 rounded-md border border-[#e3e4e1] bg-[#f8f8f6] px-4 focus-within:border-[#a21d2f] focus-within:ring-2 focus-within:ring-[#a21d2f]/15">
              <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-[#a21d2f]" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm text-[#24272c] outline-none placeholder:text-[#6f7378]"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Type de véhicule"
                type="search"
                value={search}
              />
              {search ? (
                <button
                  aria-label="Effacer la recherche"
                  className="text-[#6f7378] hover:text-[#24272c]"
                  onClick={() => setSearch("")}
                  type="button"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              ) : null}
            </span>
          </label>

          <div>
            <p className="text-sm font-bold text-[#24272c]">Categories</p>
            <div className="mt-3 space-y-2">
              {filteredCategories.slice(0, 7).map((category) => (
                <Link
                  className="flex items-center justify-between gap-3 rounded-md border border-[#e3e4e1] bg-white px-4 py-3 text-sm font-semibold text-[#4f545a] transition hover:border-[#a21d2f] hover:text-[#a21d2f]"
                  href={`#${category.slug}`}
                  key={category.id}
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-[#8b9096]">
                    {category._count.vehicles}
                  </span>
                </Link>
              ))}
              {!filteredCategories.length ? (
                <p className="rounded-md bg-[#f8f8f6] px-4 py-3 text-sm text-[#6f7378]">
                  Aucune catégorie trouvée.
                </p>
              ) : null}
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
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
            Voir les vehicules
          </Link>
        </div>
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-[#e3e4e1] bg-white px-5 py-4 shadow-[0_10px_26px_rgba(20,24,29,0.04)]">
          <p aria-live="polite" className="text-sm font-semibold text-[#6f7378]">
            Affichage de{" "}
            <span className="font-bold text-[#24272c]">
              {filteredCategories.length}
            </span>{" "}
            categories
          </p>
          <div aria-label="Mode d'affichage" className="flex items-center gap-2" role="group">
            <span className="mr-1 hidden text-sm font-semibold text-[#6f7378] sm:inline">
              Affichage
            </span>
            <button
              aria-label="Afficher en grille"
              aria-pressed={view === "grid"}
              className={`grid h-10 w-10 place-items-center rounded-md border transition ${view === "grid" ? "border-[#a21d2f] bg-[#a21d2f] text-white" : "border-[#e3e4e1] bg-white text-[#24272c] hover:border-[#a21d2f]"}`}
              onClick={() => setView("grid")}
              type="button"
            >
              <Grid2X2 aria-hidden="true" className="h-5 w-5" />
            </button>
            <button
              aria-label="Afficher en liste"
              aria-pressed={view === "list"}
              className={`grid h-10 w-10 place-items-center rounded-md border transition ${view === "list" ? "border-[#a21d2f] bg-[#a21d2f] text-white" : "border-[#e3e4e1] bg-white text-[#24272c] hover:border-[#a21d2f]"}`}
              onClick={() => setView("list")}
              type="button"
            >
              <List aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </div>

        {filteredCategories.length ? (
          <div
            className={`mt-6 grid gap-6 ${view === "grid" ? "md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}
          >
            {filteredCategories.map((category) => (
              <CategoryTile category={category} key={category.id} view={view} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-md border border-dashed border-[#cfd1cd] bg-white p-10 text-center">
            <BadgeCheck aria-hidden="true" className="mx-auto h-9 w-9 text-[#a21d2f]" />
            <h2 className="mt-4 text-xl font-bold">
              {categories.length ? "Aucune catégorie trouvée" : "Aucune categorie visible"}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#6f7378]">
              {categories.length
                ? "Essayez un autre nom ou effacez votre recherche."
                : "Les categories activees pour cette page apparaitront ici."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryTile({
  category,
  view,
}: {
  category: CategoryCard;
  view: "grid" | "list";
}) {
  const Icon = iconMap[category.icon || "car"] ?? Car;
  const vehicleLabel = category._count.vehicles > 1 ? "vehicules" : "vehicule";

  return (
    <Link
      className={`group overflow-hidden rounded-md border border-[#e3e4e1] bg-white shadow-[0_10px_28px_rgba(20,24,29,0.05)] transition hover:-translate-y-1 hover:border-[#a21d2f]/50 hover:shadow-[0_20px_50px_rgba(36,39,44,0.12)] ${view === "list" ? "grid md:grid-cols-[280px_1fr]" : ""}`}
      href="/#vehicules"
      id={category.slug}
      title={category.description || category.name}
    >
      <div className={`relative aspect-[1.35] bg-[#ececea] ${view === "list" ? "md:aspect-auto md:min-h-60" : ""}`}>
        <Image
          alt={category.name}
          className="object-cover transition duration-500 group-hover:scale-105"
          fill
          sizes={view === "list" ? "(max-width: 768px) 100vw, 280px" : "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"}
          src={category.image || "/showroom-hero.png"}
        />
        <span className="absolute inset-0 bg-gradient-to-t from-[#111214]/60 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-md bg-[#a21d2f] px-3 py-1.5 text-xs font-bold uppercase text-white">
            Categorie
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#24272c] px-3 py-1.5 text-xs font-bold text-white">
            <Images aria-hidden="true" className="h-3.5 w-3.5" />
            {category._count.vehicles}
          </span>
        </div>
        <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-md bg-white text-[#24272c] shadow-sm transition group-hover:bg-[#a21d2f] group-hover:text-white">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>

      <div className="p-5">
        <h2 className="text-xl font-bold leading-tight text-[#24272c] transition group-hover:text-[#a21d2f]">
          {category.name}
        </h2>
        <p className="mt-2 text-sm leading-7 text-[#6f7378]">
          {category.description || "Categorie disponible dans le showroom."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3 border-y border-[#e3e4e1] py-4 text-sm font-semibold text-[#6f7378]">
          <span className="inline-flex items-center gap-2">
            <Icon aria-hidden="true" className="h-4 w-4 text-[#a21d2f]" /> Type
          </span>
          <span className="inline-flex items-center gap-2">
            <CarFront aria-hidden="true" className="h-4 w-4 text-[#a21d2f]" /> Showroom
          </span>
          <span className="inline-flex items-center gap-2">
            <Gauge aria-hidden="true" className="h-4 w-4 text-[#a21d2f]" /> Disponible
          </span>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-lg font-bold text-[#24272c]">
            {category._count.vehicles} {vehicleLabel}
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#a21d2f]">
            Voir
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
