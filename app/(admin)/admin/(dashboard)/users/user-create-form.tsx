"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  createAdminUserAction,
  type AdminUserActionState,
} from "./actions";

const initialState: AdminUserActionState = {};

export function UserCreateForm() {
  const [state, action, pending] = useActionState(
    createAdminUserAction,
    initialState,
  );

  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>
          Nom
          <input className={inputClass} name="name" required />
          {state.errors?.name ? (
            <span className={errorClass}>{state.errors.name.join(" ")}</span>
          ) : null}
        </label>
        <label className={labelClass}>
          Email
          <input className={inputClass} name="email" required type="email" />
          {state.errors?.email ? (
            <span className={errorClass}>{state.errors.email.join(" ")}</span>
          ) : null}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>
          Mot de passe initial
          <input
            autoComplete="new-password"
            className={inputClass}
            name="password"
            required
            type="password"
          />
          {state.errors?.password ? (
            <span className={errorClass}>
              {state.errors.password.join(" ")}
            </span>
          ) : null}
        </label>
        <label className={labelClass}>
          Role
          <select className={inputClass} defaultValue="ADMIN" name="role">
            <option value="ADMIN">Administrateur</option>
            <option value="SUPER_ADMIN">Super administrateur</option>
          </select>
        </label>
      </div>

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

      <Button className="justify-self-start" disabled={pending} type="submit">
        <UserPlus className="h-4 w-4" />
        {pending ? "Creation..." : "Ajouter utilisateur"}
      </Button>
    </form>
  );
}

const inputClass =
  "h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4";

const labelClass = "grid gap-2 text-sm font-medium text-zinc-200";

const errorClass = "text-xs font-medium text-primary";
