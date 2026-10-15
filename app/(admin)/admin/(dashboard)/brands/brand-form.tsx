"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Plus } from "lucide-react";

import { createBrandAction, type BrandActionState } from "./actions";
import { Button } from "@/components/ui/button";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const initialState: BrandActionState = {};

export function BrandForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const [state, action, isPending] = useActionState(
    createBrandAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form action={action} className="grid gap-4" ref={formRef}>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-zinc-200">
          Nom de la marque
          <input
            className={inputClass}
            name="name"
            onChange={(event) => {
              if (slugRef.current) {
                slugRef.current.value = slugify(event.target.value);
              }
            }}
            placeholder="Land Rover"
            required
          />
          {state.fieldErrors?.name ? (
            <span className={errorClass}>
              {state.fieldErrors.name.join(" ")}
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-200">
          Slug
          <input
            className={inputClass}
            name="slug"
            placeholder="land-rover"
            ref={slugRef}
            required
          />
          {state.fieldErrors?.slug ? (
            <span className={errorClass}>
              {state.fieldErrors.slug.join(" ")}
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-200">
          Pays d&apos;origine
          <input
            className={inputClass}
            name="countryOrigin"
            placeholder="Royaume-Uni"
          />
          {state.fieldErrors?.countryOrigin ? (
            <span className={errorClass}>
              {state.fieldErrors.countryOrigin.join(" ")}
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-200">
          Logo PNG, JPG, SVG ou WebP
          <input
            accept="image/svg+xml,image/png,image/jpeg,image/webp"
            className="rounded-md border border-dashed border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 file:mr-4 file:rounded-md file:border-0 file:bg-[#a21d2f] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
            name="logo"
            type="file"
          />
        </label>
      </div>

      {state.message ? (
        <div
          className={
            state.status === "success"
              ? "rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200"
              : "rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary"
          }
          role="status"
        >
          {state.message}
        </div>
      ) : null}

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
          <input
            className="h-4 w-4 accent-primary"
            defaultChecked
            name="isActive"
            type="checkbox"
          />
          Activer la marque
        </label>
        <Button disabled={isPending} type="submit">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Ajouter la marque
        </Button>
      </div>
    </form>
  );
}

const inputClass =
  "h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4";

const errorClass = "text-xs font-medium text-primary";

