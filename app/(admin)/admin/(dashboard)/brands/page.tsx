import Image from "next/image";

import {
  toggleBrandStatusAction,
  updateBrandLogoAction,
} from "./actions";
import { BrandForm } from "./brand-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMediaUrl } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminBrand = {
  _count: {
    vehicles: number;
  };
  countryOrigin: string | null;
  id: string;
  isActive: boolean;
  logo: string | null;
  name: string;
  slug: string;
};

async function getBrands(): Promise<AdminBrand[]> {
  try {
    const prisma = getPrisma();

    return await prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: {
        _count: {
          select: { vehicles: true },
        },
        countryOrigin: true,
        id: true,
        isActive: true,
        logo: true,
        name: true,
        slug: true,
      },
    });
  } catch {
    return [];
  }
}

export default async function AdminBrandsPage() {
  const brands = await getBrands();

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Marques</h2>
          <p className="mt-2 text-zinc-400">
            Gere les constructeurs, logos et pays d&apos;origine.
          </p>
        </div>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle>Ajouter une marque</CardTitle>
        </CardHeader>
        <CardContent>
          <BrandForm />
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle>Liste des marques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border border-zinc-800">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Logo</th>
                  <th className="px-4 py-3">Marque</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Pays</th>
                  <th className="px-4 py-3">Vehicules</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {brands.map((brand) => (
                  <tr className="transition hover:bg-white/[0.03]" key={brand.id}>
                    <td className="px-4 py-3">
                      <div className="grid gap-2">
                        <span className="grid h-12 w-16 place-items-center overflow-hidden rounded-md border border-zinc-800 bg-white p-2">
                          {brand.logo ? (
                            <Image
                              alt=""
                              className="h-full w-full object-contain"
                              height={48}
                              src={getMediaUrl(brand.logo)}
                              unoptimized
                              width={64}
                            />
                          ) : (
                            <span className="text-xs font-semibold text-[#050b20]">
                              {brand.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </span>
                        <form action={updateBrandLogoAction} className="grid gap-2">
                          <input name="id" type="hidden" value={brand.id} />
                          <input
                            accept="image/svg+xml,image/png,image/jpeg,image/webp"
                            className="max-w-44 text-xs text-zinc-500 file:mr-2 file:rounded file:border-0 file:bg-zinc-800 file:px-2 file:py-1 file:text-xs file:text-zinc-200"
                            name="logo"
                            type="file"
                          />
                          <button
                            className="w-max text-xs font-semibold text-[#ffc10a] hover:text-[#ffd24a]"
                            type="submit"
                          >
                            Remplacer
                          </button>
                        </form>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-100">
                      {brand.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{brand.slug}</td>
                    <td className="px-4 py-3 text-zinc-300">
                      {brand.countryOrigin || "-"}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {brand._count.vehicles}
                    </td>
                    <td className="px-4 py-3">
                      <form action={toggleBrandStatusAction}>
                        <input name="id" type="hidden" value={brand.id} />
                        <input
                          name="isActive"
                          type="hidden"
                          value={brand.isActive ? "false" : "true"}
                        />
                        <button type="submit">
                          <Badge
                            className={
                              brand.isActive
                                ? "border-[#ffc10a]/40 bg-[#ffc10a]/10 text-[#ffc10a]"
                                : "border-zinc-700 bg-zinc-800 text-zinc-400"
                            }
                            variant="outline"
                          >
                            {brand.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!brands.length ? (
              <div className="border-t border-zinc-800 p-8 text-center text-sm text-zinc-400">
                Aucune marque trouvee. Lancez le seed Prisma.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
