import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMediaUrl } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";
import { getShowroomSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

async function getLogoMediaOptions() {
  try {
    const prisma = getPrisma();
    const assets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        height: true,
        id: true,
        localPath: true,
        mimeType: true,
        originalName: true,
        title: true,
        width: true,
      },
      take: 48,
      where: {
        mimeType: {
          startsWith: "image/",
        },
      },
    });

    return assets.map((asset) => ({
      height: asset.height,
      id: asset.id,
      localPath: asset.localPath,
      name: asset.title || asset.originalName,
      previewUrl: getMediaUrl(asset.localPath),
      width: asset.width,
    }));
  } catch {
    return [];
  }
}

export default async function AdminSettingsPage() {
  const [settings, mediaOptions] = await Promise.all([
    getShowroomSettings(),
    getLogoMediaOptions(),
  ]);

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Parametres</h2>
        <p className="mt-2 text-zinc-400">
          Personnalisez l&apos;identite affichee sur le site, la connexion et le backoffice.
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle>Identite du showroom</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm mediaOptions={mediaOptions} settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
