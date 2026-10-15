"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  requestPasswordResetAction,
  type PasswordActionState,
} from "../password-actions";

const initialState: PasswordActionState = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-2 text-sm font-medium">
        Email
        <input
          autoComplete="email"
          className="h-11 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-zinc-50 outline-none ring-primary/30 transition focus:ring-4"
          name="email"
          placeholder="admin@autopro.local"
          required
          type="email"
        />
        {state.errors?.email ? (
          <span className="text-xs font-medium text-primary">
            {state.errors.email.join(" ")}
          </span>
        ) : null}
      </label>

      {state.message ? (
        <div
          className={
            state.status === "success"
              ? "rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200"
              : "rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary"
          }
        >
          <p>{state.message}</p>
          {state.resetUrl ? (
            <p className="mt-2 break-all text-xs text-zinc-300">
              {state.resetUrl}
            </p>
          ) : null}
        </div>
      ) : null}

      <Button className="w-full" disabled={pending} type="submit">
        <Mail className="h-4 w-4" />
        {pending ? "Envoi..." : "Recevoir le lien"}
      </Button>
      <Link
        className="text-center text-sm font-semibold text-primary transition hover:text-[#a21d2f]"
        href="/admin/login"
      >
        Retour a la connexion
      </Link>
    </form>
  );
}
