"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  Search,
  Settings2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

export type HeroCarouselVehicle = {
  badge: string;
  fuel: string | null;
  imageUrl: string;
  mileage: string | null;
  price: string;
  slug: string;
  title: string;
  transmission: string | null;
  year: string | null;
};

type HeroCarouselProps = {
  vehicles: HeroCarouselVehicle[];
};

export function HeroCarousel({ vehicles }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeVehicle = vehicles[activeIndex] ?? vehicles[0];

  useEffect(() => {
    if (vehicles.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % vehicles.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, [vehicles.length]);

  function showPrevious() {
    setActiveIndex((index) => (index - 1 + vehicles.length) % vehicles.length);
  }

  function showNext() {
    setActiveIndex((index) => (index + 1) % vehicles.length);
  }

  if (!activeVehicle) return null;

  return (
    <section
      id="top"
      className="relative min-h-[650px] overflow-hidden bg-[#070707] text-white sm:min-h-[720px] lg:min-h-[780px]"
    >
      {vehicles.map((vehicle, index) => (
        <Image
          alt=""
          className={
            index === activeIndex
              ? "hero-slide-image opacity-100"
              : "hero-slide-image scale-[1.03] opacity-0"
          }
          fill
          key={`${vehicle.slug}-${vehicle.imageUrl}`}
          priority={index === 0}
          sizes="100vw"
          src={vehicle.imageUrl}
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,7,7,0.9),rgba(7,7,7,0.58)_52%,rgba(7,7,7,0.24)),linear-gradient(0deg,rgba(7,7,7,0.82),rgba(7,7,7,0.10)_45%,rgba(7,7,7,0.38))]" />

      <div className="relative z-10 mx-auto flex min-h-[650px] max-w-7xl flex-col justify-end px-4 pb-24 pt-24 sm:min-h-[720px] sm:px-8 lg:min-h-[780px] lg:pb-28">
        <div
          className="hero-slide-content grid gap-8 lg:grid-cols-[minmax(0,1fr)_410px] lg:items-end"
          key={activeVehicle.slug}
        >
          <div className="max-w-3xl pb-4 lg:pb-10">
            <p className="text-base font-semibold text-[#a21d2f] sm:text-lg">
              Premium, inspecte et accompagne
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-[0.98] tracking-normal text-white sm:text-7xl lg:text-8xl">
              {activeVehicle.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
              Selection, inspection et export de vehicules premium depuis la Coree avec un accompagnement clair a chaque etape.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#a21d2f] px-6 text-sm font-bold text-white transition hover:bg-white hover:text-[#111111]"
                href="/#vehicules"
              >
                Voir le stock
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/28 bg-white/10 px-6 text-sm font-bold text-white transition hover:bg-white hover:text-[#111111]"
                href="/#contact"
              >
                Nous contacter
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <SpecItem
              icon={Settings2}
              label="Transmission"
              value={activeVehicle.transmission || "Sur demande"}
            />
            <SpecItem
              icon={Fuel}
              label="Carburant"
              value={activeVehicle.fuel || "Disponible"}
            />
            <SpecItem
              icon={Gauge}
              label="Kilometrage"
              value={activeVehicle.mileage || "Sur demande"}
            />
            <SpecItem
              icon={Calendar}
              label="Annee"
              value={activeVehicle.year || "Sur demande"}
            />
            <Link
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-bold text-[#111111] transition hover:bg-[#a21d2f] hover:text-white sm:col-span-2 lg:col-span-1"
              href={`/vehicules/${activeVehicle.slug}`}
            >
              <Search className="h-4 w-4" />
              Plus d&apos;infos
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-5">
          {vehicles.length > 1 ? (
            <div className="flex items-center gap-2">
              <button
                aria-label="Vehicule precedent"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/18 bg-white/10 transition hover:bg-white hover:text-[#1b1b1b]"
                onClick={showPrevious}
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                aria-label="Vehicule suivant"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/18 bg-white/10 transition hover:bg-white hover:text-[#1b1b1b]"
                onClick={showNext}
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
          <div className="flex items-center gap-3">
            {vehicles.slice(0, 4).map((vehicle, index) => (
              <button
                aria-label={`Afficher ${vehicle.title}`}
                className={
                  index === activeIndex
                    ? "h-1.5 w-12 rounded-full bg-white transition-all duration-500"
                    : "h-1.5 w-7 rounded-full bg-white/60 transition-all duration-500 hover:bg-white"
                }
                key={vehicle.slug}
                onClick={() => setActiveIndex(index)}
                type="button"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-24 items-center gap-4 rounded-md border border-white/14 bg-white/10 p-5 backdrop-blur-md">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-white text-[#111111]">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-medium text-white/70">{label}</p>
        <p className="mt-1 text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
