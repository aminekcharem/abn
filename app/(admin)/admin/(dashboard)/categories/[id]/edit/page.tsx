import { notFound } from "next/navigation";

import { CategoryEditForm } from "../../category-edit-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getCategory(id: string) {
  try {
    const prisma = getPrisma();

    return await prisma.category.findUnique({
      select: {
        description: true,
        icon: true,
        id: true,
        image: true,
        isActive: true,
        name: true,
        order: true,
        showOnCategoriesPage: true,
        showOnHomepage: true,
        slug: true,
      },
      where: { id },
    });
  } catch {
    return null;
  }
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">
          Modifier la categorie
        </h2>
        <p className="mt-2 text-zinc-400">
          Changez le nom, l&apos;icone, le SVG/image, la description et le statut.
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle>{category.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryEditForm category={category} />
        </CardContent>
      </Card>
    </div>
  );
}
