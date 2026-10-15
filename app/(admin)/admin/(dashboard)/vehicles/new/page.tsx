import {
  VehicleForm,
  type VehicleFormInitialData,
  type VehicleMediaLibraryAsset,
} from "../vehicle-form";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const initialData: VehicleFormInitialData = {
  title: "",
  slug: "",
  brandId: "",
  categoryId: "",
  model: "",
  generation: "",
  trim: "",
  engineCode: "",
  motorization: "",
  price: "",
  priceCurrency: "TND",
  year: "",
  firstRegistrationDate: "",
  status: "DISPONIBLE",
  isFeatured: false,
  isNew: false,
  power: "",
  displacement: "",
  engine: "",
  fuelType: "ESSENCE",
  transmission: "",
  gearbox: "",
  mileage: "",
  doors: "",
  seats: "",
  colorName: "",
  colorHex: "#111111",
  registration: "",
  vin: "",
  optionIds: [],
  images: [],
  videos: [],
  description: "",
};

async function getFormOptions() {
  try {
    const prisma = getPrisma();
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
    return {
      brands,
      categories,
      hasDatabaseError: false,
      mediaAssets: mediaAssets as VehicleMediaLibraryAsset[],
      options,
    };
  } catch {
    return {
      brands: [],
      categories: [],
      hasDatabaseError: true,
      mediaAssets: [],
      options: [],
    };
  }
}

export default async function NewVehiclePage() {
  const { brands, categories, hasDatabaseError, mediaAssets, options } =
    await getFormOptions();

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">
          Ajouter un vehicule
        </h2>
        <p className="mt-2 text-zinc-400">
          Creation complete d&apos;une annonce showroom.
        </p>
      </div>

      {hasDatabaseError ? (
        <div className="rounded-md border border-[#a21d2f]/30 bg-[#a21d2f]/10 px-4 py-3 text-sm text-[#a21d2f]">
          Connexion MySQL indisponible. Demarrez MySQL puis appliquez les
          migrations pour charger les marques, categories et options.
        </div>
      ) : null}

      <VehicleForm
        brands={brands}
        categories={categories}
        initialData={initialData}
        mediaAssets={mediaAssets}
        mode="create"
        options={options}
      />
    </div>
  );
}
