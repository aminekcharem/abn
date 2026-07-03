"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  resendPasswordResetAction,
  type AdminUserActionState,
} from "./actions";

const initialState: AdminUserActionState = {};

export function ResendResetForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(
    resendPasswordResetAction,
    initialState,
  );

  return (
    <form action={action} className="grid gap-2">
      <input name="id" type="hidden" value={userId} />
      <Button disabled={pending} size="sm" type="submit" variant="outline">
        <Send className="h-4 w-4" />
        {pending ? "Envoi..." : "Renvoyer le lien"}
      </Button>
      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "text-xs text-emerald-300"
              : "text-xs text-primary"
          }
        >
          {state.message}
        </p>
      ) : null}
      {state.resetUrl ? (
        <p className="break-all text-xs text-zinc-500">{state.resetUrl}</p>
      ) : null}
    </form>
  );
}
