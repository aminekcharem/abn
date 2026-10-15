"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function AdminLoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(initialError);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setError(undefined);

    startTransition(async () => {
      const result = await signIn("credentials", {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    });
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
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
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Mot de passe
        <input
          autoComplete="current-password"
          className="h-11 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-zinc-50 outline-none ring-primary/30 transition focus:ring-4"
          name="password"
          placeholder="********"
          required
          type="password"
        />
      </label>
      {error ? (
        <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          Identifiants admin invalides.
        </p>
      ) : null}
      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Connexion..." : "Se connecter"}
      </Button>
      <Link
        className="text-center text-sm font-semibold text-primary transition hover:text-[#a21d2f]"
        href="/admin/forgot-password"
      >
        Mot de passe oublie ?
      </Link>
    </form>
  );
}
