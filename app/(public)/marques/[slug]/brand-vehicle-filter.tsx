"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Fuel, Gauge, Heart } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { getMediaUrl } from "@/lib/cdn";
import {
  getVehicleStatusBadgeClassName,
  type PublicVehicleStatus,
} from "@/lib/public-vehicle-status";

export type BrandFilterVehicle = {
  brandName: string;
  categoryName: string;
  fuel: string | null;
  id: string;
  image: string | null;
  mileage: number | null;
  model: string;
  priceLabel: string;
  slug: string;
  status: PublicVehicleStatus;
  statusLabel: string;
  title: string;
  transmission: string | null;
  year: number | null;
};

type FilterState = {
  fuel: string;
  model: string;
  transmission: string;
  type: string;
};

type BrandVehicleFilterProps = {
  emptyTitle: string;
  vehicles: BrandFilterVehicle[];
};

const emptyFilters: FilterState = {
  fuel: "",
  model: "",
  transmission: "",
  type: "",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b, "fr"));
}

export function BrandVehicleFilter({
  emptyTitle,
  vehicles,
}: BrandVehicleFilterProps) {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);

  const vehicleMatches = useCallback(
    (vehicle: BrandFilterVehicle, overrides: Partial<FilterState> = {}) => {
      const activeFilters = { ...filters, ...overrides };

      return (
        (!activeFilters.model || vehicle.model === activeFilters.model) &&
        (!activeFilters.fuel || vehicle.fuel === activeFilters.fuel) &&
        (!activeFilters.transmission ||
          vehicle.transmission === activeFilters.transmission) &&
        (!activeFilters.type || vehicle.categoryName === activeFilters.type)
      );
    },
    [filters],
  );

  const options = useMemo(
    () => ({
      fuels: uniqueValues(
        vehicles
          .filter((vehicle) => vehicleMatches(vehicle, { fuel: "" }))
          .map((vehicle) => vehicle.fuel),
      ),
      models: uniqueValues(
        vehicles
          .filter((vehicle) => vehicleMatches(vehicle, { model: "" }))
          .map((vehicle) => vehicle.model),
      ),
      transmissions: uniqueValues(
        vehicles
          .filter((vehicle) => vehicleMatches(vehicle, { transmission: "" }))
          .map((vehicle) => vehicle.transmission),
      ),
      types: uniqueValues(
        vehicles
          .filter((vehicle) => vehicleMatches(vehicle, { type: "" }))
          .map((vehicle) => vehicle.categoryName),
      ),
    }),
    [vehicleMatches, vehicles],
  );

  const filteredVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicleMatches(vehicle)),
    [vehicleMatches, vehicles],
  );

  function updateFilter(name: keyof FilterState, value: string) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  return (
    <>
      <div className="mb-7 rounded-md border border-[#e3e4e1] bg-white p-5 shadow-[0_12px_34px_rgba(20,24,29,0.06)]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectField
            label="Modèle"
            onChange={(value) => updateFilter("model", value)}
            options={options.models}
            placeholder="Tous les modèles"
            value={filters.model}
          />
          <SelectField
            label="Carburant"
            onChange={(value) => updateFilter("fuel", value)}
            options={options.fuels}
            placeholder="Tous les carburants"
            value={filters.fuel}
          />
          <SelectField
            label="Boîte"
            onChange={(value) => updateFilter("transmission", value)}
            options={options.transmissions}
            placeholder="Toutes les boîtes"
            value={filters.transmission}
          />
          <SelectField
            label="Type"
            onChange={(value) => updateFilter("type", value)}
            options={options.types}
            placeholder="Tous les types"
            value={filters.type}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-xs text-[#1b1b1b]/50">
            {filteredVehicles.length} résultat(s)
          </span>
          <button
            className="rounded-md border border-[#1b1b1b]/10 px-4 py-2 text-xs font-semibold text-[#1b1b1b]/60 transition hover:border-[#a21d2f] hover:text-[#a21d2f]"
            onClick={() => setFilters(emptyFilters)}
            type="button"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {filteredVehicles.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-[#1b1b1b]/15 bg-white p-10 text-center">
          <h2 className="text-xl font-semibold">{emptyTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#1b1b1b]/62">
            Aucun véhicule ne correspond aux filtres sélectionnés.
          </p>
        </div>
      )}
    </>
  );
}

function SelectField({
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1b1b1b]/45">
        {label}
      </span>
      <select
        className="w-full rounded-md border border-[#1b1b1b]/10 bg-white px-3 py-2.5 text-sm text-[#1b1b1b] outline-none transition focus:border-[#a21d2f]"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function VehicleCard({ vehicle }: { vehicle: BrandFilterVehicle }) {
  return (
    <article className="group overflow-hidden rounded-md border border-[#ececec] bg-white shadow-[0_10px_28px_rgba(20,24,29,0.05)] transition hover:-translate-y-1 hover:border-[#a21d2f]/35 hover:shadow-[0_18px_42px_rgba(20,24,29,0.1)]">
      <Link className="block" href={`/vehicules/${vehicle.slug}`}>
        <div className="relative h-56 overflow-hidden bg-white">
          <Image
            alt={vehicle.title}
            className="object-cover transition duration-300 group-hover:scale-105"
            fill
            sizes="(max-width: 1280px) 50vw, 33vw"
            src={vehicle.image ? getMediaUrl(vehicle.image) : "/showroom-hero.png"}
          />
          <span className={`absolute left-4 top-4 ${getVehicleStatusBadgeClassName(vehicle.status)}`}>
            {vehicle.statusLabel}
          </span>
          <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white text-[#1b1b1b]">
            <Heart className="h-4 w-4" />
          </span>
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold text-[#1b1b1b]/45">
            {vehicle.brandName} / {vehicle.categoryName}
          </p>
          <h2 className="mt-2 line-clamp-1 font-semibold">{vehicle.title}</h2>
          <p className="mt-2 text-xs leading-5 text-[#1b1b1b]/60">
            {vehicle.year
              ? `Modèle ${vehicle.year} dans le stock du showroom.`
              : "Véhicule visible dans le stock du showroom."}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 border-y border-[#1b1b1b]/10 py-3 text-center text-[11px] text-[#1b1b1b]/62">
            {vehicle.year ? (
              <span className="flex min-w-0 items-center justify-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{vehicle.year}</span>
              </span>
            ) : null}
            {vehicle.mileage !== null ? (
              <span className="flex min-w-0 items-center justify-center gap-1">
                <Gauge className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{formatNumber(vehicle.mileage)} km</span>
              </span>
            ) : null}
            {vehicle.fuel ? (
              <span className="flex min-w-0 items-center justify-center gap-1">
                <Fuel className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{vehicle.fuel}</span>
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="font-semibold">{vehicle.priceLabel}</p>
            <span className="inline-flex min-h-9 items-center rounded-md border border-[#ececec] px-3 text-xs font-semibold text-[#1b1b1b] transition group-hover:border-[#a21d2f] group-hover:text-[#a21d2f]">
              Voir le détail
            </span>
          </div>
          {vehicle.transmission ? (
            <p className="mt-3 text-xs text-[#1b1b1b]/50">
              {vehicle.transmission}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
