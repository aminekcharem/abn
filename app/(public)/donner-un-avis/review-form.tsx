"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Star } from "lucide-react";

import { createReviewAction, type ReviewFormState } from "./actions";

const initialState: ReviewFormState = {};

export function ReviewForm() {
  const [state, formAction] = useActionState(createReviewAction, initialState);
  const [rating, setRating] = useState(5);

  return (
    <form action={formAction} className="grid gap-5 rounded-md border border-[#1b1b1b]/10 bg-white p-5 shadow-sm sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Prénom
          <input className={inputClass} name="firstName" required />
        </label>
        <label className={labelClass}>
          Nom
          <input className={inputClass} name="lastName" required />
        </label>
      </div>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-semibold text-[#1b1b1b]">Nombre d&apos;étoiles</legend>
        <input name="rating" type="hidden" value={rating} />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;
            const active = value <= rating;

            return (
              <button
                aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                className={`grid h-11 w-11 place-items-center rounded-md border transition ${
                  active
                    ? "border-[#ffc10a] bg-[#ffc10a] text-[#1b1b1b]"
                    : "border-[#1b1b1b]/10 bg-white text-[#1b1b1b]/35 hover:border-[#ffc10a]"
                }`}
                key={value}
                onClick={() => setRating(value)}
                type="button"
              >
                <Star className={active ? "h-5 w-5 fill-current" : "h-5 w-5"} />
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className={labelClass}>
        Message
        <textarea
          className="min-h-36 rounded-md border border-[#1b1b1b]/10 bg-white px-4 py-3 text-sm text-[#1b1b1b] outline-none ring-[#ffc10a]/30 transition placeholder:text-[#1b1b1b]/40 focus:border-[#ffc10a] focus:ring-4"
          maxLength={1200}
          name="message"
          required
        />
      </label>

      <label className="flex items-start gap-3 rounded-md border border-[#1b1b1b]/10 bg-white p-4 text-sm font-semibold text-[#1b1b1b]/75">
        <input className="mt-0.5 h-4 w-4 accent-[#ffc10a]" name="isAnonymous" type="checkbox" />
        Rendre mon avis anonyme sur le site
      </label>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          {state.success}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1b1b1b] px-6 text-sm font-semibold text-white transition hover:bg-[#ffc10a] hover:text-[#1b1b1b] disabled:opacity-60 sm:w-max"
      disabled={pending}
      type="submit"
    >
      {pending ? "Envoi en cours..." : "Envoyer mon avis"}
    </button>
  );
}

const inputClass =
  "h-11 rounded-md border border-[#1b1b1b]/10 bg-white px-4 text-sm text-[#1b1b1b] outline-none ring-[#ffc10a]/30 transition placeholder:text-[#1b1b1b]/40 focus:border-[#ffc10a] focus:ring-4";

const labelClass = "grid gap-2 text-sm font-semibold text-[#1b1b1b]";
