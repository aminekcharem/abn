"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

const updateReviewSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  isAnonymous: z.coerce.boolean(),
  isPublished: z.coerce.boolean(),
  lastName: z.string().trim().min(2).max(80),
  message: z.string().trim().min(10).max(1200),
  rating: z.coerce.number().int().min(1).max(5),
});

async function ensureAdmin() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function revalidateReviews() {
  revalidatePath("/");
  revalidatePath("/avis");
  revalidatePath("/admin/reviews");
}

export async function updateReviewAction(id: string, formData: FormData) {
  await ensureAdmin();

  const parsed = updateReviewSchema.safeParse({
    firstName: formData.get("firstName"),
    isAnonymous: getBoolean(formData, "isAnonymous"),
    isPublished: getBoolean(formData, "isPublished"),
    lastName: formData.get("lastName"),
    message: formData.get("message"),
    rating: formData.get("rating"),
  });

  if (!parsed.success) {
    throw new Error("Avis invalide.");
  }

  const prisma = getPrisma();

  await prisma.review.update({
    data: parsed.data,
    where: { id },
  });

  revalidateReviews();
}

export async function toggleReviewPublishedAction(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get("id") ?? "");
  const isPublished = getBoolean(formData, "isPublished");

  if (!id) {
    throw new Error("Avis introuvable.");
  }

  const prisma = getPrisma();

  await prisma.review.update({
    data: { isPublished },
    where: { id },
  });

  revalidateReviews();
}

export async function toggleReviewAnonymousAction(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get("id") ?? "");
  const isAnonymous = getBoolean(formData, "isAnonymous");

  if (!id) {
    throw new Error("Avis introuvable.");
  }

  const prisma = getPrisma();

  await prisma.review.update({
    data: { isAnonymous },
    where: { id },
  });

  revalidateReviews();
}

export async function deleteReviewAction(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    throw new Error("Avis introuvable.");
  }

  const prisma = getPrisma();

  await prisma.review.delete({ where: { id } });

  revalidateReviews();
}
