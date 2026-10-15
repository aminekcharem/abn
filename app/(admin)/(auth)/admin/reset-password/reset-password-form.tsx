"use client";

import { useActionState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  resetPasswordAction,
  type PasswordActionState,
} from "../password-actions";

const initialState: PasswordActionState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <form action={action} className="grid gap-4">
      <input name="token" type="hidden" value={token} />
      <label className="grid gap-2 text-sm font-medium">
        Nouveau mot de passe
        <input
          autoComplete="new-password"
          className="h-11 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-zinc-50 outline-none ring-primary/30 transition focus:ring-4"
          name="password"
          required
          type="password"
        />
        {state.errors?.password ? (
          <span className="text-xs font-medium text-primary">
            {state.errors.password.join(" ")}
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
          {state.message}
        </div>
      ) : null}

      <Button className="w-full" disabled={pending} type="submit">
        <KeyRound className="h-4 w-4" />
        {pending ? "Mise a jour..." : "Changer le mot de passe"}
      </Button>
      {state.status === "success" ? (
        <Link
          className="text-center text-sm font-semibold text-primary transition hover:text-[#a21d2f]"
          href="/admin/login"
        >
          Se connecter
        </Link>
      ) : null}
    </form>
  );
}
