"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getPrisma } from "@/lib/prisma";

export type ReviewFormState = {
  error?: string;
  success?: string;
};

const reviewSchema = z.object({
  firstName: z.string().trim().min(2, "Le prénom est obligatoire.").max(80),
  isAnonymous: z.coerce.boolean(),
  lastName: z.string().trim().min(2, "Le nom est obligatoire.").max(80),
  message: z.string().trim().min(10, "Le message doit contenir au moins 10 caractères.").max(1200),
  rating: z.coerce.number().int().min(1).max(5),
});

export async function createReviewAction(
  _state: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const parsed = reviewSchema.safeParse({
    firstName: formData.get("firstName"),
    isAnonymous: formData.get("isAnonymous") === "on",
    lastName: formData.get("lastName"),
    message: formData.get("message"),
    rating: formData.get("rating"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Veuillez vérifier le formulaire.",
    };
  }

  try {
    const prisma = getPrisma();

    await prisma.review.create({
      data: {
        ...parsed.data,
        isPublished: false,
      },
    });

    revalidatePath("/admin/reviews");

    return {
      success:
        "Merci pour votre avis. Il sera publié après validation par notre équipe.",
    };
  } catch {
    return {
      error: "Impossible d'enregistrer votre avis pour le moment.",
    };
  }
}
