"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Car, Fuel, Gauge, Wrench } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { getMediaUrl } from "@/lib/cdn";
import {
  getVehicleStatusBadgeClassName,
  getVehicleStatusLabel,
  type PublicVehicleStatus,
} from "@/lib/public-vehicle-status";

export type HomeInventoryVehicle = {
  brandName: string;
  categoryName: string;
  categorySlug: string;
  fuel: string | null;
  id: string;
  image: string | null;
  isFeatured: boolean;
  mileage: number | null;
  model: string | null;
  price: number;
  priceLabel: string;
  slug: string;
  status: PublicVehicleStatus;
  title: string;
  transmission: string | null;
  year: number | null;
};

type RangeState = {
  max: number;
  min: number;
};

type FilterState = {
  brand: string;
  fuel: string;
  model: string;
  transmission: string;
  type: string;
};

type HomeInventorySearchProps = {
  vehicles: HomeInventoryVehicle[];
};

const emptyFilters: FilterState = {
  brand: "",
  fuel: "",
  model: "",
  transmission: "",
  type: "",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
}

function getBounds(values: Array<number | null>) {
  const numericValues = values.filter((value): value is number => typeof value === "number");

  if (!numericValues.length) return { max: 0, min: 0 };

  return {
    max: Math.max(...numericValues),
    min: Math.min(...numericValues),
  };
}

function modelLabel(vehicle: HomeInventoryVehicle) {
  return vehicle.model || vehicle.title;
}

function rangeMatches(value: number | null, range: RangeState, bounds: RangeState) {
  if (value === null) return range.min === bounds.min && range.max === bounds.max;

  return value >= range.min && value <= range.max;
}

export function HomeInventorySearch({ vehicles }: HomeInventorySearchProps) {
  const bounds = useMemo(
    () => ({
      mileage: getBounds(vehicles.map((vehicle) => vehicle.mileage)),
      price: getBounds(vehicles.map((vehicle) => vehicle.price)),
      year: getBounds(vehicles.map((vehicle) => vehicle.year)),
    }),
    [vehicles],
  );

  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [priceRange, setPriceRange] = useState<RangeState>(bounds.price);
  const [yearRange, setYearRange] = useState<RangeState>(bounds.year);
  const [mileageRange, setMileageRange] = useState<RangeState>(bounds.mileage);

  const vehicleMatches = useCallback(
    (vehicle: HomeInventoryVehicle, overrides: Partial<FilterState> = {}) => {
      const activeFilters = { ...filters, ...overrides };

      return (
        (!activeFilters.brand || vehicle.brandName === activeFilters.brand) &&
        (!activeFilters.model || modelLabel(vehicle) === activeFilters.model) &&
        (!activeFilters.fuel || vehicle.fuel === activeFilters.fuel) &&
        (!activeFilters.transmission || vehicle.transmission === activeFilters.transmission) &&
        (!activeFilters.type || vehicle.categoryName === activeFilters.type) &&
        rangeMatches(vehicle.price, priceRange, bounds.price) &&
        rangeMatches(vehicle.year, yearRange, bounds.year) &&
        rangeMatches(vehicle.mileage, mileageRange, bounds.mileage)
      );
    },
    [bounds, filters, mileageRange, priceRange, yearRange],
  );

  const options = useMemo(
    () => ({
      brands: uniqueValues(
        vehicles
          .filter((vehicle) => vehicleMatches(vehicle, { brand: "" }))
          .map((vehicle) => vehicle.brandName),
      ),
      fuels: uniqueValues(
        vehicles
          .filter((vehicle) => vehicleMatches(vehicle, { fuel: "" }))
          .map((vehicle) => vehicle.fuel),
      ),
      models: uniqueValues(
        vehicles
          .filter((vehicle) => vehicleMatches(vehicle, { model: "" }))
          .map((vehicle) => modelLabel(vehicle)),
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
    setFilters((current) => ({
      ...current,
      [name]: value,
      model: name === "model" ? value : "",
    }));
  }

  function resetFilters() {
    setFilters(emptyFilters);
    setPriceRange(bounds.price);
    setYearRange(bounds.year);
    setMileageRange(bounds.mileage);
  }

  return (
    <>
      <div className="mb-7 rounded-[10px] bg-white p-5 shadow-[0_6px_24px_rgba(20,24,29,0.08)]">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <SelectField
            label="Marque"
            onChange={(value) => updateFilter("brand", value)}
            options={options.brands}
            placeholder="Toutes les marques"
            value={filters.brand}
          />
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
        <div className="mt-5 grid gap-6 border-t border-[#e3e4e1] pt-5 md:grid-cols-3">
          <RangeFilter
            bounds={bounds.price}
            label="Prix"
            onChange={setPriceRange}
            value={priceRange}
          />
          <RangeFilter
            bounds={bounds.year}
            label="Année"
            onChange={setYearRange}
            value={yearRange}
          />
          <RangeFilter
            bounds={bounds.mileage}
            label="Kilométrage"
            onChange={setMileageRange}
            suffix=" km"
            value={mileageRange}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            className="rounded-lg border border-[#e3e4e1] px-4 py-2 text-xs font-semibold text-[#5b6470] transition hover:border-[#c98a0b] hover:text-[#c98a0b]"
            onClick={resetFilters}
            type="button"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold uppercase tracking-normal text-[#14181d] sm:text-3xl">
          Nos véhicules
          <span className="mt-2 block h-0.5 w-14 bg-[#f2a414]" />
        </h2>
        <span className="font-mono text-xs text-[#5b6470]">
          {filteredVehicles.length} résultat(s)
        </span>
      </div>

      {filteredVehicles.length ? (
        <VehicleGrid vehicles={filteredVehicles} />
      ) : (
        <div className="rounded-[10px] border border-dashed border-[#14181d]/15 bg-white p-8 text-center text-sm text-[#5b6470]">
          Aucun véhicule ne correspond aux filtres sélectionnés.
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
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5b6470]">
        {label}
      </span>
      <select
        className="w-full rounded-lg border border-[#e3e4e1] bg-white px-3 py-2.5 text-sm text-[#14181d] outline-none transition focus:border-[#f2a414]"
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

function RangeFilter({
  bounds,
  label,
  onChange,
  suffix = "",
  value,
}: {
  bounds: RangeState;
  label: string;
  onChange: (value: RangeState) => void;
  suffix?: string;
  value: RangeState;
}) {
  const disabled = bounds.min === bounds.max;
  const span = Math.max(bounds.max - bounds.min, 1);
  const left = ((value.min - bounds.min) / span) * 100;
  const right = 100 - ((value.max - bounds.min) / span) * 100;
  const rangeInputClassName =
    "pointer-events-none absolute top-0 h-7 w-full appearance-none bg-transparent accent-[#14181d] [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto";

  function updateMin(nextValue: number) {
    onChange({ ...value, min: Math.min(nextValue, value.max) });
  }

  function updateMax(nextValue: number) {
    onChange({ ...value, max: Math.max(nextValue, value.min) });
  }

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs text-[#5b6470]">
        <span>
          {formatNumber(value.min)}
          {suffix}
        </span>
        <span>
          {formatNumber(value.max)}
          {suffix}
        </span>
      </div>
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5b6470]">
        {label}
      </span>
      <div className="relative h-7">
        <div className="absolute left-0 right-0 top-3 h-1 rounded-full bg-[#e3e4e1]" />
        <div
          className="absolute top-3 h-1 rounded-full bg-[#f2a414]"
          style={{ left: `${left}%`, right: `${right}%` }}
        />
        <input
          aria-label={`${label} minimum`}
          className={`${rangeInputClassName} z-20`}
          disabled={disabled}
          max={bounds.max}
          min={bounds.min}
          onChange={(event) => updateMin(Number(event.target.value))}
          type="range"
          value={value.min}
        />
        <input
          aria-label={`${label} maximum`}
          className={`${rangeInputClassName} z-10`}
          disabled={disabled}
          max={bounds.max}
          min={bounds.min}
          onChange={(event) => updateMax(Number(event.target.value))}
          type="range"
          value={value.max}
        />
      </div>
    </div>
  );
}

function VehicleGrid({ vehicles }: { vehicles: HomeInventoryVehicle[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}

function VehicleCard({ vehicle }: { vehicle: HomeInventoryVehicle }) {
  return (
    <article className="flex overflow-hidden rounded-[10px] bg-white shadow-[0_6px_24px_rgba(20,24,29,0.08)] transition hover:-translate-y-1">
      <Link className="flex w-full flex-col" href={`/vehicles/${vehicle.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-[#1f2630]">
          {vehicle.image ? (
            <Image
              alt={vehicle.title}
              className="object-cover transition duration-300 hover:scale-105"
              fill
              sizes="(max-width: 900px) 100vw, 33vw"
              src={getMediaUrl(vehicle.image)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-[linear-gradient(150deg,#232b36,#161b22)] text-white/45">
              <Car className="h-12 w-12" />
              <small className="font-mono text-xs uppercase tracking-[0.18em]">
                {vehicle.brandName}
              </small>
            </div>
          )}
          <span className={`absolute left-3 top-3 ${getVehicleStatusBadgeClassName(vehicle.status)}`}>
            {getVehicleStatusLabel(vehicle.status)}
          </span>
          {vehicle.isFeatured ? (
            <span className="absolute right-3 top-3 rounded-md bg-black/55 px-3 py-1 text-[11px] font-semibold text-white">
              Rapport
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="min-h-11 text-base font-semibold leading-snug">{vehicle.title}</h3>
          <div className="flex flex-wrap gap-3 text-xs text-[#5b6470]">
            {vehicle.mileage !== null ? (
              <span className="inline-flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5" />
                {formatNumber(vehicle.mileage)} km
              </span>
            ) : null}
            {vehicle.fuel ? (
              <span className="inline-flex items-center gap-1.5">
                <Fuel className="h-3.5 w-3.5" />
                {vehicle.fuel}
              </span>
            ) : null}
            {vehicle.transmission ? (
              <span className="inline-flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5" />
                {vehicle.transmission}
              </span>
            ) : null}
            {vehicle.year ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {vehicle.year}
              </span>
            ) : null}
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#e3e4e1] pt-4">
            <div>
              <span className="text-xl font-semibold">{vehicle.priceLabel}</span>
              <div className="text-[11px] text-[#5b6470]">Hors frais de transport</div>
            </div>
            <span className="rounded-md bg-[#14181d] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#f2a414] hover:text-[#14181d]">
              Voir détails
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
