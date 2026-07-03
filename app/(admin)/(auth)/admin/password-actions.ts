"use server";

import { z } from "zod";

import { sendPasswordResetEmail } from "@/lib/admin-user-mail";
import {
  createPasswordResetToken,
  getPasswordResetUrl,
  hashPasswordResetToken,
} from "@/lib/password-reset";
import { hashPassword } from "@/lib/password";
import { getPrisma } from "@/lib/prisma";

export type PasswordActionState = {
  errors?: {
    email?: string[];
    password?: string[];
    token?: string[];
  };
  message?: string;
  resetUrl?: string;
  status?: "error" | "success";
};

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Adresse e-mail invalide.")
    .transform((value) => value.toLowerCase()),
});

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caracteres."),
  token: z.string().trim().min(20, "Lien de reinitialisation invalide."),
});

export async function requestPasswordResetAction(
  _state: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Veuillez saisir une adresse e-mail valide.",
      status: "error",
    };
  }

  const prisma = getPrisma();
  const user = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user) {
    return {
      message:
        "Si cette adresse existe, un e-mail de reinitialisation sera envoye.",
      status: "success",
    };
  }

  const resetToken = createPasswordResetToken();

  await prisma.adminUser.update({
    data: {
      resetTokenExpiresAt: resetToken.expiresAt,
      resetTokenHash: resetToken.tokenHash,
    },
    where: { id: user.id },
  });

  const resetUrl = getPasswordResetUrl(resetToken.token);
  const mailResult = await sendPasswordResetEmail({
    email: user.email,
    name: user.name,
    resetUrl,
  });

  return {
    message: mailResult.skipped
      ? "SMTP n'est pas configure. Utilisez le lien ci-dessous."
      : "Un e-mail de reinitialisation a ete envoye.",
    resetUrl: mailResult.skipped ? resetUrl : undefined,
    status: "success",
  };
}

export async function resetPasswordAction(
  _state: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    token: formData.get("token"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Veuillez corriger les champs du formulaire.",
      status: "error",
    };
  }

  const prisma = getPrisma();
  const tokenHash = hashPasswordResetToken(parsed.data.token);
  const user = await prisma.adminUser.findFirst({
    where: {
      resetTokenExpiresAt: { gt: new Date() },
      resetTokenHash: tokenHash,
    },
  });

  if (!user) {
    return {
      errors: { token: ["Lien invalide ou expire."] },
      message: "Lien invalide ou expire.",
      status: "error",
    };
  }

  await prisma.adminUser.update({
    data: {
      password: hashPassword(parsed.data.password),
      resetTokenExpiresAt: null,
      resetTokenHash: null,
    },
    where: { id: user.id },
  });

  return {
    message: "Mot de passe mis a jour. Vous pouvez vous connecter.",
    status: "success",
  };
}
