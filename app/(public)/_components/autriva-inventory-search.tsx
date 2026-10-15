"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Car, Fuel, Gauge, ImageIcon, Search, Wrench } from "lucide-react";
import { useMemo, useState } from "react";

import { getMediaUrl } from "@/lib/cdn";
import {
  getVehicleStatusBadgeClassName,
  getVehicleStatusLabel,
} from "@/lib/public-vehicle-status";
import type { HomeInventoryVehicle } from "./home-inventory-search";

type FilterState = {
  brand: string;
  fuel: string;
  model: string;
  type: string;
};

const emptyFilters: FilterState = {
  brand: "",
  fuel: "",
  model: "",
  type: "",
};

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function modelLabel(vehicle: HomeInventoryVehicle) {
  return vehicle.model || vehicle.title;
}

export function AutrivaInventorySearch({
  vehicles,
}: {
  vehicles: HomeInventoryVehicle[];
}) {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);

  const options = useMemo(
    () => ({
      brands: uniqueValues(vehicles.map((vehicle) => vehicle.brandName)),
      fuels: uniqueValues(vehicles.map((vehicle) => vehicle.fuel)),
      models: uniqueValues(vehicles.map((vehicle) => modelLabel(vehicle))),
      types: uniqueValues(vehicles.map((vehicle) => vehicle.categoryName)),
    }),
    [vehicles],
  );

  const filteredVehicles = useMemo(
    () =>
      vehicles.filter(
        (vehicle) =>
          (!filters.brand || vehicle.brandName === filters.brand) &&
          (!filters.model || modelLabel(vehicle) === filters.model) &&
          (!filters.fuel || vehicle.fuel === filters.fuel) &&
          (!filters.type || vehicle.categoryName === filters.type),
      ),
    [filters, vehicles],
  );

  function updateFilter(name: keyof FilterState, value: string) {
    setFilters((current) => ({
      ...current,
      [name]: value,
      model: name === "model" ? value : current.model,
    }));
  }

  return (
    <>
      <div className="mb-14 rounded-md border border-white/10 bg-[#111111] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-6">
        <div className="mb-5 flex flex-wrap gap-2 border-b border-white/10 pb-5">
          <button className="rounded-md bg-[#a21d2f] px-5 py-3 text-sm font-bold text-white" type="button">
            Toutes categories
          </button>
          <button className="rounded-md bg-white/8 px-5 py-3 text-sm font-bold text-white/75" type="button">
            Neufs
          </button>
          <button className="rounded-md bg-white/8 px-5 py-3 text-sm font-bold text-white/75" type="button">
            Occasions
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
          <SelectField
            label="Marque"
            onChange={(value) => updateFilter("brand", value)}
            options={options.brands}
            placeholder="Toutes les marques"
            value={filters.brand}
          />
          <SelectField
            label="Carrosserie"
            onChange={(value) => updateFilter("type", value)}
            options={options.types}
            placeholder="Tous les types"
            value={filters.type}
          />
          <SelectField
            label="Modele"
            onChange={(value) => updateFilter("model", value)}
            options={options.models}
            placeholder="Tous les modeles"
            value={filters.model}
          />
          <SelectField
            label="Carburant"
            onChange={(value) => updateFilter("fuel", value)}
            options={options.fuels}
            placeholder="Tous les carburants"
            value={filters.fuel}
          />
          <button
            className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-md bg-[#a21d2f] px-6 text-sm font-bold text-white transition hover:bg-white hover:text-[#111111]"
            type="button"
          >
            <Search className="h-4 w-4" />
            Rechercher
          </button>
        </div>
      </div>

      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold tracking-normal text-[#111111] sm:text-4xl">
          Vehicules recommandes
        </h2>
        <span className="mt-3 inline-flex rounded-md border border-[#e7e7e7] px-4 py-2 text-xs font-bold text-[#5b6470]">
          {filteredVehicles.length} resultat(s)
        </span>
      </div>

      {filteredVehicles.length ? (
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-[#14181d]/15 bg-white p-8 text-center text-sm text-[#5b6470]">
          Aucun vehicule ne correspond aux filtres selectionnes.
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
      <span className="mb-1.5 block text-[11px] font-semibold uppercase text-white/55">
        {label}
      </span>
      <select
        className="w-full rounded-md border border-white/10 bg-white px-3 py-3 text-sm font-semibold text-[#14181d] outline-none transition focus:border-[#a21d2f]"
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

function VehicleCard({ vehicle }: { vehicle: HomeInventoryVehicle }) {
  const specs = [
    {
      Icon: Gauge,
      label: vehicle.mileage !== null ? `${formatNumber(vehicle.mileage)} Km` : "-",
    },
    {
      Icon: Wrench,
      label: vehicle.transmission || "-",
    },
    {
      Icon: Fuel,
      label: vehicle.fuel || "-",
    },
  ];

  return (
    <article className="flex overflow-hidden rounded-md border border-[#ececec] bg-white shadow-[0_10px_28px_rgba(20,24,29,0.05)] transition hover:-translate-y-1 hover:border-[#a21d2f]/35 hover:shadow-[0_18px_38px_rgba(20,24,29,0.1)]">
      <Link className="flex w-full flex-col" href={`/vehicules/${vehicle.slug}`}>
        <div className="relative aspect-[1.38] overflow-hidden bg-[#f5f5f5]">
          {vehicle.image ? (
            <Image
              alt={vehicle.title}
              className="object-cover transition duration-300 hover:scale-105"
              fill
              sizes="(max-width: 900px) 100vw, 25vw"
              src={getMediaUrl(vehicle.image)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-[linear-gradient(150deg,#232b36,#161b22)] text-white/45">
              <Car className="h-12 w-12" />
              <small className="font-mono text-xs uppercase">{vehicle.brandName}</small>
            </div>
          )}
          <div className="absolute left-3 top-3 flex items-center">
            <span className={getVehicleStatusBadgeClassName(vehicle.status)}>
              {getVehicleStatusLabel(vehicle.status)}
            </span>
            {vehicle.imageCount > 0 ? (
              <span className="inline-flex h-8 items-center gap-1 bg-[#24272c]/80 px-3 text-xs font-bold text-white">
                <ImageIcon className="h-4 w-4" />
                {vehicle.imageCount}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-1 flex-col px-4 pb-3 pt-6">
          <h3 className="min-h-[52px] text-lg font-bold leading-snug text-[#050b20] sm:text-[19px]">
            {vehicle.title}
          </h3>
          <div className="mt-4 grid grid-cols-3 border-b border-[#e9e9e9] pb-4 text-[11px] leading-snug text-[#050b20] sm:text-xs">
            {specs.map(({ Icon, label }, index) => (
              <span
                className={`inline-flex min-w-0 items-start gap-1.5 ${
                  index === 0 ? "justify-start pr-2" : ""
                } ${index === 1 ? "justify-center border-x border-[#e9e9e9] px-2" : ""} ${
                  index === 2 ? "justify-end pl-2" : ""
                }`}
                key={`${vehicle.id}-${label}-${index}`}
                title={label}
              >
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a21d2f] sm:h-4 sm:w-4" />
                <span className="min-w-0 whitespace-normal break-words">{label}</span>
              </span>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
            <span className="min-w-0 break-words text-xl font-bold leading-tight text-[#050b20] sm:text-2xl">
              {vehicle.priceLabel}
            </span>
            <span className="inline-flex h-10 shrink-0 items-center gap-2 border border-[#ececec] px-4 text-sm font-bold text-[#050b20] transition hover:border-[#a21d2f] hover:text-[#a21d2f]">
              Voir
              <ArrowRight className="h-5 w-5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
