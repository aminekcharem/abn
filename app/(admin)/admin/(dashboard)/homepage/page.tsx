import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMediaUrl } from "@/lib/cdn";
import { getHomepageSettings } from "@/lib/homepage-settings";
import { getPrisma } from "@/lib/prisma";
import { HomepageForm } from "./homepage-form";

export const dynamic = "force-dynamic";

const initialMediaLimit = 60;

async function getHomepageEditorData() {
  try {
    const prisma = getPrisma();

    const [settings, vehicles, categories, mediaOptions] = await Promise.all([
      getHomepageSettings(),
      prisma.vehicle.findMany({
        include: {
          brand: { select: { name: true } },
          category: { select: { name: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        where: { status: { not: "BROUILLON" } },
      }),
      prisma.category.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: {
          id: true,
          isActive: true,
          name: true,
          order: true,
          showOnHomepage: true,
        },
      }),
      prisma.mediaAsset.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          height: true,
          id: true,
          localPath: true,
          originalName: true,
          title: true,
          width: true,
        },
        take: initialMediaLimit + 1,
        where: { mimeType: { startsWith: "image/" } },
      }),
    ]);
    const visibleMediaOptions = mediaOptions.slice(0, initialMediaLimit);

    return {
      categories,
      hasMoreMedia: mediaOptions.length > initialMediaLimit,
      mediaOptions: visibleMediaOptions.map((asset) => ({
        height: asset.height,
        id: asset.id,
        localPath: asset.localPath,
        name: asset.title || asset.originalName,
        previewUrl: getMediaUrl(asset.localPath),
        width: asset.width,
      })),
      settings,
      vehicles: vehicles.map((vehicle) => ({
        brandName: vehicle.brand.name,
        categoryName: vehicle.category.name,
        id: vehicle.id,
        images: Array.isArray(vehicle.images)
          ? vehicle.images.filter((image): image is string => typeof image === "string")
          : [],
        isFeatured: vehicle.isFeatured,
        title: vehicle.title,
        year: vehicle.year,
      })),
    };
  } catch {
    return {
      categories: [],
      hasMoreMedia: false,
      mediaOptions: [],
      settings: await getHomepageSettings(),
      vehicles: [],
    };
  }
}

export default async function AdminHomepagePage() {
  const data = await getHomepageEditorData();

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">
          Configuration page d&apos;accueil
        </h2>
        <p className="mt-2 text-zinc-400">
          Gere le hero, les sections visibles, les vehicules mis en avant et les
          avis affiches sur la page publique.
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Contenu de la home</CardTitle>
        </CardHeader>
        <CardContent>
          <HomepageForm {...data} />
        </CardContent>
      </Card>
    </div>
  );
}
