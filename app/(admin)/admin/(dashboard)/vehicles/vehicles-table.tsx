"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  deleteVehicleAction,
  deleteVehiclesAction,
  markVehicleAsDraftAction,
} from "@/app/(admin)/admin/(dashboard)/vehicles/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type VehicleTableRow = {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  brand: string;
  category: string;
  price: number;
  priceCurrency: "TND" | "EUR";
  power: number | null;
  year: number | null;
  status: "BROUILLON" | "DISPONIBLE" | "VENDU" | "RESERVE";
  createdAt: string;
};

export type VehicleFilterOption = {
  id: string;
  name: string;
};

type VehiclesTableProps = {
  vehicles: VehicleTableRow[];
  brands: VehicleFilterOption[];
  categories: VehicleFilterOption[];
  total: number;
  page: number;
  perPage: number;
  sort: "price" | "year" | "createdAt";
  dir: "asc" | "desc";
};

const statusLabels = {
  BROUILLON: "Brouillon",
  DISPONIBLE: "Disponible",
  VENDU: "Vendu",
  RESERVE: "Reserve",
};

const statusStyles = {
  BROUILLON: "border-zinc-600 bg-zinc-800 text-zinc-300",
  DISPONIBLE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  VENDU: "border-[#a21d2f]/40 bg-[#a21d2f]/10 text-[#a21d2f]",
  RESERVE: "border-orange-500/30 bg-orange-500/10 text-orange-300",
};

function formatPrice(price: number, currency: "TND" | "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function VehiclesTable({
  vehicles,
  brands,
  categories,
  total,
  page,
  perPage,
  sort,
  dir,
}: VehiclesTableProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const allVisibleSelected =
    vehicles.length > 0 && vehicles.every((vehicle) => selectedSet.has(vehicle.id));

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    if (!("page" in updates)) {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function toggleVehicle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  function toggleAllVisible() {
    setSelected((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !vehicles.some((vehicle) => vehicle.id === id));
      }

      return Array.from(new Set([...current, ...vehicles.map((vehicle) => vehicle.id)]));
    });
  }

  function confirmDelete(count: number) {
    return window.confirm(
      count > 1
        ? `Supprimer definitivement ${count} vehicules ?`
        : "Supprimer definitivement ce vehicule ?",
    );
  }

  function sortIcon(column: "price" | "year" | "createdAt") {
    if (sort !== column) return <ChevronsUpDown className="h-3.5 w-3.5" />;
    return dir === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
  }

  function nextSortDir(column: "price" | "year" | "createdAt") {
    return sort === column && dir === "asc" ? "desc" : "asc";
  }

  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="grid gap-4">
      <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end">
        <form
          action=""
          className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_180px_170px_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            updateParams({
              search: String(formData.get("search") ?? "").trim() || null,
              brand: String(formData.get("brand") ?? "") || null,
              category: String(formData.get("category") ?? "") || null,
              status: String(formData.get("status") ?? "") || null,
            });
          }}
        >
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Recherche
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 pl-9 pr-3 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4"
                defaultValue={searchParams.get("search") ?? ""}
                name="search"
                placeholder="Titre ou marque"
              />
            </div>
          </label>

          <FilterSelect label="Marque" name="brand" options={brands} />
          <FilterSelect label="Categorie" name="category" options={categories} />

          <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Statut
            <select
              className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm normal-case text-zinc-100 outline-none ring-primary/30 transition focus:ring-4"
              defaultValue={searchParams.get("status") ?? ""}
              name="status"
            >
              <option value="">Tous</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="VENDU">Vendu</option>
              <option value="RESERVE">Reserve</option>
            </select>
          </label>

          <div className="flex items-end gap-2">
            <Button disabled={isPending} type="submit">
              Filtrer
            </Button>
            <Button
              disabled={isPending}
              onClick={() =>
                updateParams({
                  search: null,
                  brand: null,
                  category: null,
                  status: null,
                  page: null,
                })
              }
              type="button"
              variant="outline"
            >
              Reset
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <form
            action={deleteVehiclesAction}
            onSubmit={(event) => {
              if (!selected.length || !confirmDelete(selected.length)) {
                event.preventDefault();
              }
            }}
          >
            {selected.map((id) => (
              <input key={id} name="id" type="hidden" value={id} />
            ))}
            <Button
              disabled={!selected.length}
              type="submit"
              variant="destructive"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer ({selected.length})
            </Button>
          </form>

          <Button asChild>
            <Link href="/admin/vehicles/new">
              <Plus className="h-4 w-4" />
              Ajouter un vehicule
            </Link>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    aria-label="Selectionner tous les vehicules visibles"
                    checked={allVisibleSelected}
                    className="h-4 w-4 accent-primary"
                    onChange={toggleAllVisible}
                    type="checkbox"
                  />
                </th>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Marque</th>
                <th className="px-4 py-3">Categorie</th>
                <SortableHead
                  active={sort === "price"}
                  label="Prix"
                  onClick={() =>
                    updateParams({ sort: "price", dir: nextSortDir("price") })
                  }
                >
                  {sortIcon("price")}
                </SortableHead>
                <th className="px-4 py-3">Puissance</th>
                <th className="px-4 py-3">Statut</th>
                <SortableHead
                  active={sort === "year"}
                  label="Annee"
                  onClick={() =>
                    updateParams({ sort: "year", dir: nextSortDir("year") })
                  }
                >
                  {sortIcon("year")}
                </SortableHead>
                <SortableHead
                  active={sort === "createdAt"}
                  label="Cree le"
                  onClick={() =>
                    updateParams({
                      sort: "createdAt",
                      dir: nextSortDir("createdAt"),
                    })
                  }
                >
                  {sortIcon("createdAt")}
                </SortableHead>
                <th className="w-16 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-900">
              {vehicles.map((vehicle) => (
                <tr
                  className={cn(
                    "cursor-pointer transition hover:bg-white/[0.03]",
                    selectedSet.has(vehicle.id) && "bg-primary/5",
                  )}
                  key={vehicle.id}
                  onClick={(event) => {
                    const target = event.target as HTMLElement;

                    if (
                      target.closest(
                        "a, button, input, select, textarea, form, [data-prevent-row-click]",
                      )
                    ) {
                      return;
                    }

                    router.push(`/admin/vehicles/${vehicle.id}/edit`);
                  }}
                >
                  <td className="px-4 py-3">
                    <input
                      aria-label={`Selectionner ${vehicle.title}`}
                      checked={selectedSet.has(vehicle.id)}
                      className="h-4 w-4 accent-primary"
                      onChange={() => toggleVehicle(vehicle.id)}
                      type="checkbox"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-14 w-20 overflow-hidden rounded-md bg-zinc-950">
                      {vehicle.image ? (
                        <Image
                          alt=""
                          className="h-full w-full object-cover"
                          height={56}
                          src={vehicle.image}
                          unoptimized
                          width={80}
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-[10px] text-zinc-600">
                          No image
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="max-w-[220px] px-4 py-3">
                    <p className="truncate font-semibold text-zinc-100">
                      {vehicle.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{vehicle.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{vehicle.brand}</td>
                  <td className="px-4 py-3 text-zinc-300">{vehicle.category}</td>
                  <td className="px-4 py-3 font-semibold text-zinc-100">
                    {formatPrice(vehicle.price, vehicle.priceCurrency)}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {vehicle.power ? `${vehicle.power} CV` : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusStyles[vehicle.status]} variant="outline">
                      {statusLabels[vehicle.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {vehicle.year || "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {formatDate(vehicle.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <VehicleActions vehicle={vehicle} confirmDelete={confirmDelete} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!vehicles.length ? (
          <div className="border-t border-zinc-800 bg-zinc-900 p-10 text-center text-sm text-zinc-400">
            Aucun vehicule ne correspond aux filtres.
          </div>
        ) : null}
      </div>

      <div className="flex flex-col justify-between gap-3 text-sm text-zinc-400 sm:flex-row sm:items-center">
        <p>
          {from}-{to} sur {total} vehicules
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={page <= 1 || isPending}
            onClick={() => updateParams({ page: String(page - 1) })}
            type="button"
            variant="outline"
          >
            Precedent
          </Button>
          <span className="rounded-md border border-zinc-800 px-3 py-2 text-zinc-300">
            {page} / {totalPages}
          </span>
          <Button
            disabled={page >= totalPages || isPending}
            onClick={() => updateParams({ page: String(page + 1) })}
            type="button"
            variant="outline"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: VehicleFilterOption[];
}) {
  const searchParams = useSearchParams();

  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
      {label}
      <select
        className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm normal-case text-zinc-100 outline-none ring-primary/30 transition focus:ring-4"
        defaultValue={searchParams.get(name) ?? ""}
        name={name}
      >
        <option value="">Toutes</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function SortableHead({
  active,
  children,
  label,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <th className="px-4 py-3">
      <button
        className={cn(
          "inline-flex items-center gap-1.5 transition hover:text-zinc-200",
          active && "text-zinc-200",
        )}
        onClick={onClick}
        type="button"
      >
        {label}
        {children}
      </button>
    </th>
  );
}

function VehicleActions({
  vehicle,
  confirmDelete,
}: {
  vehicle: VehicleTableRow;
  confirmDelete: (count: number) => boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Actions pour ${vehicle.title}`}
          className="bg-primary text-primary-foreground hover:bg-[#050b20] hover:text-white"
          data-prevent-row-click
          size="icon"
          variant="default"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link
            className="flex w-full items-center gap-2"
            href={`/vehicules/${vehicle.slug}`}
          >
            <Eye className="h-4 w-4" />
            Voir
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            className="flex w-full items-center gap-2"
            href={`/admin/vehicles/${vehicle.id}/edit`}
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {vehicle.status !== "BROUILLON" ? (
          <DropdownMenuItem>
            <form action={markVehicleAsDraftAction} className="w-full">
              <input name="id" type="hidden" value={vehicle.id} />
              <button className="flex w-full items-center gap-2" type="submit">
                <FileText className="h-4 w-4" />
                Mettre en brouillon
              </button>
            </form>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[#a21d2f] hover:text-[#a21d2f]">
          <form
            action={deleteVehicleAction}
            className="w-full"
            onSubmit={(event) => {
              if (!confirmDelete(1)) {
                event.preventDefault();
              }
            }}
          >
            <input name="id" type="hidden" value={vehicle.id} />
            <button className="flex w-full items-center gap-2" type="submit">
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
