"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
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
    <section id="top" className="relative min-h-[720px] overflow-hidden bg-[#1b1b1b] text-white sm:min-h-[760px] lg:min-h-[820px]">
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
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,27,27,0.88),rgba(27,27,27,0.52)_52%,rgba(27,27,27,0.22)),linear-gradient(0deg,rgba(27,27,27,0.82),rgba(27,27,27,0.12)_42%,rgba(27,27,27,0.34))]" />

      <div className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl flex-col justify-end px-4 pb-8 pt-20 sm:min-h-[760px] sm:px-8 sm:pb-10 lg:min-h-[820px] lg:pb-16 lg:pt-28">
        <div className="hero-slide-content grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center" key={activeVehicle.slug}>
          <div className="max-w-4xl pb-2 lg:pb-16">
            <p className="text-2xl font-semibold tracking-normal text-white sm:text-4xl">
              {activeVehicle.price}
            </p>
            <div className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-normal sm:text-7xl lg:text-8xl">
              {activeVehicle.title}
            </div>
            <p className="mt-5 inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-semibold uppercase text-white/78 backdrop-blur">
              {activeVehicle.badge}
            </p>
          </div>

          <div className="rounded-md border border-white/12 bg-white/12 p-6 backdrop-blur-md sm:p-8 lg:mr-2">
            <div className="grid gap-8">
              <SpecItem icon={Fuel} label="Carburant" value={activeVehicle.fuel || "Disponible"} />
              <SpecItem icon={Gauge} label="Kilométrage" value={activeVehicle.mileage || "Sur demande"} />
              <SpecItem icon={Settings2} label="Transmission" value={activeVehicle.transmission || "Sur demande"} />
              <SpecItem icon={Calendar} label="Année" value={activeVehicle.year || "Sur demande"} />
            </div>
            <Link
              className="mt-10 inline-flex h-14 w-full items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-semibold text-[#1b1b1b] transition hover:bg-[#ffc10a]"
              href={`/vehicles/${activeVehicle.slug}`}
            >
              Plus d&apos;infos
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-5">
          {vehicles.length > 1 ? (
            <div className="flex items-center gap-2">
              <button
                aria-label="Véhicule précédent"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/18 bg-white/10 transition hover:bg-white hover:text-[#1b1b1b]"
                onClick={showPrevious}
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                aria-label="Véhicule suivant"
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
    <div>
      <Icon className="h-7 w-7 text-white" />
      <p className="mt-4 text-sm font-semibold text-white/70">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
