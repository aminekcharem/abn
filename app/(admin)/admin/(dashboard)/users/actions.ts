"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { sendPasswordResetEmail } from "@/lib/admin-user-mail";
import {
  createPasswordResetToken,
  getPasswordResetUrl,
} from "@/lib/password-reset";
import { hashPassword } from "@/lib/password";
import { getPrisma } from "@/lib/prisma";

export type AdminUserActionState = {
  errors?: {
    email?: string[];
    name?: string[];
    password?: string[];
  };
  message?: string;
  resetUrl?: string;
  status?: "error" | "success";
};

const createAdminUserSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Adresse e-mail invalide.")
    .transform((value) => value.toLowerCase()),
  name: z.string().trim().min(2, "Le nom est obligatoire."),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caracteres."),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
});

async function ensureAdmin() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

export async function createAdminUserAction(
  _state: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  await ensureAdmin();

  const parsed = createAdminUserSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    password: formData.get("password"),
    role: formData.get("role") || "ADMIN",
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Veuillez corriger les champs du formulaire.",
      status: "error",
    };
  }

  const prisma = getPrisma();
  const existingUser = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return {
      errors: { email: ["Un utilisateur existe deja avec cette adresse."] },
      message: "Impossible de creer cet utilisateur.",
      status: "error",
    };
  }

  const resetToken = createPasswordResetToken();

  await prisma.adminUser.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      password: hashPassword(parsed.data.password),
      resetTokenExpiresAt: resetToken.expiresAt,
      resetTokenHash: resetToken.tokenHash,
      role: parsed.data.role,
    },
  });

  const resetUrl = getPasswordResetUrl(resetToken.token);
  const mailResult = await sendPasswordResetEmail({
    email: parsed.data.email,
    name: parsed.data.name,
    resetUrl,
    subject: "Votre acces administrateur AutoPro",
  });

  revalidatePath("/admin/users");

  return {
    message: mailResult.skipped
      ? "Utilisateur cree. SMTP n'est pas configure, utilisez le lien ci-dessous."
      : "Utilisateur cree et e-mail envoye.",
    resetUrl,
    status: "success",
  };
}

export async function resendPasswordResetAction(
  _state: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  await ensureAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    return {
      message: "Utilisateur introuvable.",
      status: "error",
    };
  }

  const prisma = getPrisma();
  const user = await prisma.adminUser.findUnique({ where: { id } });

  if (!user) {
    return {
      message: "Utilisateur introuvable.",
      status: "error",
    };
  }

  const resetToken = createPasswordResetToken();

  await prisma.adminUser.update({
    data: {
      resetTokenExpiresAt: resetToken.expiresAt,
      resetTokenHash: resetToken.tokenHash,
    },
    where: { id },
  });

  const resetUrl = getPasswordResetUrl(resetToken.token);
  const mailResult = await sendPasswordResetEmail({
    email: user.email,
    name: user.name,
    resetUrl,
  });

  revalidatePath("/admin/users");

  return {
    message: mailResult.skipped
      ? "Nouveau lien genere. SMTP n'est pas configure, utilisez le lien ci-dessous."
      : "E-mail de reinitialisation envoye.",
    resetUrl,
    status: "success",
  };
}
