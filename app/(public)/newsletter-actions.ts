"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getPrisma } from "@/lib/prisma";

export type NewsletterActionState = {
  message: string;
  status: "idle" | "error" | "success";
};

const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Adresse e-mail invalide."),
});

export async function subscribeToNewsletterAction(
  _previousState: NewsletterActionState,
  formData: FormData,
): Promise<NewsletterActionState> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      message:
        parsed.error.issues[0]?.message ??
        "Veuillez saisir une adresse e-mail valide.",
      status: "error",
    };
  }

  try {
    const prisma = getPrisma();

    await prisma.newsletterSubscriber.upsert({
      create: { email: parsed.data.email },
      update: { updatedAt: new Date() },
      where: { email: parsed.data.email },
    });

    revalidatePath("/admin/newsletter");

    return {
      message: "Parfait, vous recevrez nos prochains arrivages en avant-première.",
      status: "success",
    };
  } catch {
    return {
      message: "Nous n'avons pas pu finaliser l'inscription. Réessayez dans un instant.",
      status: "error",
    };
  }
}
