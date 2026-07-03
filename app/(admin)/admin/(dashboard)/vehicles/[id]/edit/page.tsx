import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";

import {
  VehicleForm,
  type VehicleFormInitialData,
  type VehicleMediaLibraryAsset,
} from "../../vehicle-form";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getImages(images: Prisma.JsonValue) {
  if (!Array.isArray(images)) return [];
  return images.filter((image): image is string => typeof image === "string");
}

function getVideos(videos: Prisma.JsonValue) {
  if (!Array.isArray(videos)) return [];
  return videos.filter((video): video is string => typeof video === "string");
}

function parseColor(color: string | null) {
  const match = color?.match(/^(.*)\s+\((#[0-9a-fA-F]{6})\)$/);

  return {
    colorName: match?.[1] || color || "",
    colorHex: match?.[2] || "#111111",
  };
}

function formatDateInput(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

async function getEditData(id: string) {
  try {
    const prisma = getPrisma();
    const vehicle = await prisma.vehicle.findUnique({
      include: {
        options: { select: { id: true } },
      },
      where: { id },
    });

    if (!vehicle) {
      return { hasDatabaseError: false, initialData: null };
    }

    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
      where: { isActive: true },
    });
    const categories = await prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
      where: { isActive: true },
    });
    const options = await prisma.option.findMany({
      orderBy: [
        { category: { order: "asc" } },
        { category: { name: "asc" } },
        { name: "asc" },
      ],
      select: {
        category: {
          select: { iconSvg: true, id: true, name: true, order: true },
        },
        id: true,
        name: true,
      },
      where: { category: { isActive: true } },
    });
    const mediaAssets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        alt: true,
        id: true,
        localPath: true,
        originalName: true,
        title: true,
      },
      take: 120,
      where: {
        mimeType: {
          startsWith: "image/",
        },
      },
    });

    const color = parseColor(vehicle.color);

    const initialData: VehicleFormInitialData = {
      id: vehicle.id,
      title: vehicle.title,
      slug: vehicle.slug,
      brandId: vehicle.brandId,
      categoryId: vehicle.categoryId,
      model: vehicle.model || "",
      generation: vehicle.generation || "",
      trim: vehicle.trim || "",
      engineCode: vehicle.engineCode || "",
      motorization: vehicle.motorization || "",
      price: String(vehicle.price),
      priceCurrency: vehicle.priceCurrency,
      transportIncluded: vehicle.transportIncluded,
      transportPrice: vehicle.transportPrice ? String(vehicle.transportPrice) : "",
      transportCurrency: vehicle.transportCurrency,
      year: vehicle.year ? String(vehicle.year) : "",
      firstRegistrationDate: formatDateInput(vehicle.firstRegistrationDate),
      status: vehicle.status,
      isFeatured: vehicle.isFeatured,
      isNew: vehicle.isNew,
      power: vehicle.power ? String(vehicle.power) : "",
      displacement: vehicle.displacement || "",
      engine: vehicle.engine || "",
      fuelType: vehicle.fuelType || "ESSENCE",
      transmission: vehicle.transmission || "",
      gearbox: vehicle.gearbox || "",
      mileage: vehicle.mileage ? String(vehicle.mileage) : "",
      doors: vehicle.doors ? String(vehicle.doors) : "",
      seats: vehicle.seats ? String(vehicle.seats) : "",
      colorName: color.colorName,
      colorHex: color.colorHex,
      registration: vehicle.registration || "",
      vin: vehicle.vin || "",
      optionIds: vehicle.options.map((option) => option.id),
      images: getImages(vehicle.images),
      videos: getVideos(vehicle.videos),
      description: vehicle.description || "",
    };

    return {
      brands,
      categories,
      hasDatabaseError: false,
      initialData,
      mediaAssets: mediaAssets as VehicleMediaLibraryAsset[],
      options,
    };
  } catch {
    return {
      brands: [],
      categories: [],
      hasDatabaseError: true,
      initialData: null,
      mediaAssets: [],
      options: [],
    };
  }
}

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { brands, categories, hasDatabaseError, initialData, mediaAssets, options } =
    await getEditData(id);

  if (!initialData && !hasDatabaseError) {
    notFound();
  }

  if (!initialData) {
    return (
      <div className="grid gap-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Modifier le vehicule
          </h2>
          <p className="mt-2 text-zinc-400">
            Impossible de charger cette fiche pour le moment.
          </p>
        </div>
        <div className="rounded-md border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
          Connexion MySQL indisponible. Demarrez MySQL puis verifiez les
          migrations avant de modifier ce vehicule.
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">
          Modifier le vehicule
        </h2>
        <p className="mt-2 text-zinc-400">
          Mise a jour de l&apos;annonce {initialData.title}.
        </p>
      </div>

      <VehicleForm
        brands={brands}
        categories={categories}
        initialData={initialData}
        mediaAssets={mediaAssets}
        mode="edit"
        options={options}
      />
    </div>
  );
}
