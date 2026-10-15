import Image from "next/image";
import Link from "next/link";
import { Calendar, DownloadCloud, Save, X } from "lucide-react";

import { updateMediaAssetAttributes } from "./actions";
import { MediaDeleteForm } from "./media-delete-form";
import { MediaUploadForm } from "./media-upload-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMediaUrl, isCdnConfigured } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

function parseMonthFilter(value?: string | string[]) {
  const month = Array.isArray(value) ? value[0] : value;

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return null;
  }

  const [year, monthNumber] = month.split("-").map(Number);

  if (monthNumber < 1 || monthNumber > 12) {
    return null;
  }

  const start = new Date(Date.UTC(year, monthNumber - 1, 1));
  const end = new Date(Date.UTC(year, monthNumber, 1));

  return { end, month, start };
}

async function getMediaAssets(monthFilter: ReturnType<typeof parseMonthFilter>) {
  try {
    const prisma = getPrisma();

    return {
      assets: await prisma.mediaAsset.findMany({
        where: monthFilter
          ? {
              createdAt: {
                gte: monthFilter.start,
                lt: monthFilter.end,
              },
            }
          : undefined,
        orderBy: { createdAt: "desc" },
        take: 80,
      }),
      hasDatabaseError: false,
    };
  } catch {
    return { assets: [], hasDatabaseError: true };
  }
}

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const monthFilter = parseMonthFilter((await searchParams).month);
  const { assets, hasDatabaseError } = await getMediaAssets(monthFilter);
  const cdnConfigured = isCdnConfigured();

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Media</h2>
        <p className="mt-2 text-zinc-400">
          Bibliotheque des images du site, conversion WebP et URLs compatibles CDN.
        </p>
      </div>

      {hasDatabaseError ? (
        <div className="rounded-md border border-[#a21d2f]/30 bg-[#a21d2f]/10 px-4 py-3 text-sm text-[#a21d2f]">
          Connexion MySQL indisponible. Appliquez les migrations puis regenerez
          le client Prisma pour activer le module media.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle>Ajouter des images</CardTitle>
            <CardDescription>
              Les images lourdes sont optimisees avant stockage local.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MediaUploadForm />
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Bibliotheque</CardTitle>
                <CardDescription>
                  {assets.length} media{assets.length > 1 ? "s" : ""}
                  {monthFilter ? ` mis en ligne en ${monthFilter.month}` : " recents"}.
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <form className="flex flex-wrap items-center gap-2" method="get">
                  <label className="sr-only" htmlFor="media-month">
                    Mois de mise en ligne
                  </label>
                  <div className="flex h-9 items-center gap-2 rounded-md border border-zinc-800 bg-black px-3 text-xs text-zinc-100 ring-primary/30 transition focus-within:ring-4">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    <input
                      className="bg-transparent text-xs text-zinc-100 outline-none [color-scheme:dark]"
                      defaultValue={monthFilter?.month ?? ""}
                      id="media-month"
                      name="month"
                      type="month"
                    />
                  </div>
                  <Button size="sm" type="submit">
                    Filtrer
                  </Button>
                  {monthFilter ? (
                    <Button asChild size="icon" title="Reinitialiser le filtre" variant="outline">
                      <Link href="/admin/media">
                        <X className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                </form>
                <div className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400">
                  CDN {cdnConfigured ? "configure" : "non configure"}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {assets.length ? (
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {assets.map((asset) => {
                  const publicUrl = getMediaUrl(asset.localPath);
                  const isVideo = asset.mimeType.startsWith("video/");

                  return (
                    <article
                      className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-950"
                      key={asset.id}
                    >
                      <div className="relative aspect-[4/3] bg-zinc-900">
                        {isVideo ? (
                          <video
                            className="h-full w-full object-contain"
                            controls
                            preload="metadata"
                            src={publicUrl}
                            title={asset.title || undefined}
                          />
                        ) : (
                          <Image
                            alt={asset.alt || asset.title || asset.originalName}
                            className="object-cover"
                            fill
                            sizes="(max-width: 1280px) 50vw, 33vw"
                            src={publicUrl}
                            title={asset.title || undefined}
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="grid gap-3 p-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-zinc-100">
                            {asset.originalName}
                          </h3>
                          <p className="mt-1 text-xs text-zinc-500">
                            {asset.mimeType} - {formatSize(asset.size)}
                            {asset.width && asset.height
                              ? ` - ${asset.width} x ${asset.height}px`
                              : ""}
                          </p>
                        </div>

                        <code className="block overflow-hidden text-ellipsis rounded-md border border-zinc-800 bg-black px-3 py-2 text-xs text-zinc-400">
                          {publicUrl}
                        </code>

                        <form action={updateMediaAssetAttributes} className="grid gap-2">
                          <input name="id" type="hidden" value={asset.id} />
                          <label className="grid gap-1 text-xs font-medium text-zinc-300">
                            Alt
                            <input
                              className={inputClass}
                              defaultValue={asset.alt || ""}
                              maxLength={191}
                              name="alt"
                              placeholder="Description courte pour l'accessibilite"
                            />
                          </label>
                          <label className="grid gap-1 text-xs font-medium text-zinc-300">
                            Title
                            <input
                              className={inputClass}
                              defaultValue={asset.title || ""}
                              maxLength={191}
                              name="title"
                              placeholder="Titre de l'image"
                            />
                          </label>
                          <label className="grid gap-1 text-xs font-medium text-zinc-300">
                            Caption
                            <textarea
                              className="min-h-20 rounded-md border border-zinc-800 bg-black px-3 py-2 text-xs text-zinc-100 outline-none ring-primary/30 transition focus:ring-4"
                              defaultValue={asset.caption || ""}
                              maxLength={1000}
                              name="caption"
                              placeholder="Legende affichee ou descriptive"
                            />
                          </label>
                          <Button className="w-full" size="sm" type="submit">
                            <Save className="h-4 w-4" />
                            Enregistrer les attributs
                          </Button>
                        </form>

                        <div className="flex items-center justify-between gap-2">
                          <Button asChild size="sm" variant="outline">
                            <a href={publicUrl} target="_blank">
                              <DownloadCloud className="h-4 w-4" />
                              Ouvrir
                            </a>
                          </Button>
                          <MediaDeleteForm
                            assetId={asset.id}
                            assetName={asset.title || asset.originalName}
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-md border border-zinc-800 bg-zinc-950 p-10 text-center text-sm text-zinc-500">
                {monthFilter
                  ? "Aucun media pour ce mois."
                  : "Aucun media pour le moment."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const inputClass =
  "h-9 rounded-md border border-zinc-800 bg-black px-3 text-xs text-zinc-100 outline-none ring-primary/30 transition focus:ring-4";
