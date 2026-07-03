import { Suspense } from "react";
import { Prisma, VehicleStatus } from "@prisma/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPrisma } from "@/lib/prisma";
import {
  VehiclesTable,
  type VehicleFilterOption,
  type VehicleTableRow,
} from "./vehicles-table";

export const dynamic = "force-dynamic";

const perPage = 20;
const vehicleStatuses = ["BROUILLON", "DISPONIBLE", "VENDU", "RESERVE"] as const;
const sortColumns = ["price", "year", "createdAt"] as const;

type SearchParams = {
  brand?: string;
  category?: string;
  status?: string;
  search?: string;
  page?: string;
  sort?: string;
  dir?: string;
};

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseStatus(value?: string) {
  return vehicleStatuses.includes(value as VehicleStatus)
    ? (value as VehicleStatus)
    : undefined;
}

function parseSort(value?: string): "price" | "year" | "createdAt" {
  return sortColumns.includes(value as (typeof sortColumns)[number])
    ? (value as (typeof sortColumns)[number])
    : "createdAt";
}

function parseDir(value?: string): "asc" | "desc" {
  return value === "asc" ? "asc" : "desc";
}

function getFirstImage(images: Prisma.JsonValue) {
  if (!Array.isArray(images)) return null;

  const first = images.find((image) => typeof image === "string");
  return typeof first === "string" ? first : null;
}

async function getVehiclePage(params: SearchParams) {
  const prisma = getPrisma();
  const page = parsePage(params.page);
  const status = parseStatus(params.status);
  const sort = parseSort(params.sort);
  const dir = parseDir(params.dir);
  const search = params.search?.trim();

  const where: Prisma.VehicleWhereInput = {
    ...(params.brand ? { brandId: params.brand } : {}),
    ...(params.category ? { categoryId: params.category } : {}),
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { brand: { name: { contains: search } } },
          ],
        }
      : {}),
  };

  const [vehicles, total, brands, categories] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { [sort]: dir },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.vehicle.count({ where }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
      where: { isActive: true },
    }),
    prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
      where: { isActive: true },
    }),
  ]);

  return {
    brands: brands as VehicleFilterOption[],
    categories: categories as VehicleFilterOption[],
    page,
    rows: vehicles.map(
      (vehicle): VehicleTableRow => ({
        id: vehicle.id,
        title: vehicle.title,
        slug: vehicle.slug,
        image: getFirstImage(vehicle.images),
        brand: vehicle.brand.name,
        category: vehicle.category.name,
        price: Number(vehicle.price),
        priceCurrency: vehicle.priceCurrency,
        power: vehicle.power,
        year: vehicle.year,
        status: vehicle.status,
        createdAt: vehicle.createdAt.toISOString(),
      }),
    ),
    total,
    sort,
    dir,
  };
}

export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  let data: Awaited<ReturnType<typeof getVehiclePage>>;

  try {
    data = await getVehiclePage(params);
  } catch {
    data = {
      brands: [],
      categories: [],
      dir: parseDir(params.dir),
      page: parsePage(params.page),
      rows: [],
      sort: parseSort(params.sort),
      total: 0,
    };
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Vehicules</h2>
        <p className="mt-2 text-zinc-400">
          Gestion du stock showroom, filtres avances et actions rapides.
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle>Inventaire</CardTitle>
          <CardDescription>
            Liste paginee des vehicules avec recherche, tri et suppression groupee.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="rounded-md border border-zinc-800 p-10 text-center text-sm text-zinc-400">
                Chargement des vehicules...
              </div>
            }
          >
            <VehiclesTable
              brands={data.brands}
              categories={data.categories}
              dir={data.dir}
              page={data.page}
              perPage={perPage}
              sort={data.sort}
              total={data.total}
              vehicles={data.rows}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
