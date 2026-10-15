"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import {
  subscribeToNewsletterAction,
  type NewsletterActionState,
} from "../newsletter-actions";

const initialNewsletterActionState: NewsletterActionState = {
  message: "",
  status: "idle",
};

export function NewsletterForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    subscribeToNewsletterAction,
    initialNewsletterActionState,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  const isSuccess = state.status === "success";
  const FeedbackIcon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div className="grid gap-2 md:ml-auto md:w-full md:max-w-xl">
      <form
        action={formAction}
        className="flex rounded-full border border-white/10 bg-white p-1"
        ref={formRef}
      >
        <input
          className="min-w-0 flex-1 bg-transparent px-4 text-sm text-[#1b1b1b] outline-none placeholder:text-[#1b1b1b]/45"
          disabled={isPending}
          name="email"
          placeholder="Votre adresse e-mail"
          required
          type="email"
        />
        <button
          className="rounded-full bg-[#a21d2f] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#111111] disabled:cursor-wait disabled:opacity-70"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Envoi..." : "S'inscrire"}
        </button>
      </form>
      {state.message ? (
        <div
          aria-live="polite"
          className={
            isSuccess
              ? "flex items-start gap-2 rounded-md border border-[#a21d2f]/35 bg-[#a21d2f]/12 px-4 py-3 text-sm font-medium text-[#fff4c2] shadow-lg shadow-black/10"
              : "flex items-start gap-2 rounded-md border border-red-300/35 bg-red-500/12 px-4 py-3 text-sm font-medium text-red-100 shadow-lg shadow-black/10"
          }
          role="status"
        >
          <FeedbackIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      ) : null}
    </div>
  );
}
