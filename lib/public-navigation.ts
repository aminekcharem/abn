import { unstable_cache } from "next/cache";

import { getPrisma } from "@/lib/prisma";

export type PublicBrandLink = {
  href: string;
  label: string;
  vehicleCount: number;
};

async function readPublicBrandLinks(): Promise<PublicBrandLink[]> {
  try {
    const prisma = getPrisma();
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: {
        name: true,
        slug: true,
        _count: {
          select: {
            vehicles: {
              where: { status: { not: "BROUILLON" } },
            },
          },
        },
      },
      where: {
        isActive: true,
        vehicles: {
          some: { status: { not: "BROUILLON" } },
        },
      },
    });

    return brands.map((brand) => ({
      href: `/marques/${brand.slug}`,
      label: brand.name,
      vehicleCount: brand._count.vehicles,
    }));
  } catch {
    return [];
  }
}

export const getPublicBrandLinks = unstable_cache(
  readPublicBrandLinks,
  ["public-brand-links"],
  {
    revalidate: 300,
    tags: ["public-brand-links"],
  },
);
