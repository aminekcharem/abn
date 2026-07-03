"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

const deleteSubscriberSchema = z.object({
  id: z.string().min(1),
});

async function ensureAdmin() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

export async function deleteNewsletterSubscriberAction(formData: FormData) {
  await ensureAdmin();

  const parsed = deleteSubscriberSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    throw new Error("Email newsletter introuvable.");
  }

  const prisma = getPrisma();

  await prisma.newsletterSubscriber.delete({
    where: { id: parsed.data.id },
  });

  revalidatePath("/admin/newsletter");
}
