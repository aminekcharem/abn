import { ShieldCheck, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrisma } from "@/lib/prisma";
import { ResendResetForm } from "./resend-reset-form";
import { UserCreateForm } from "./user-create-form";

export const dynamic = "force-dynamic";

async function getAdminUsers() {
  try {
    const prisma = getPrisma();

    return await prisma.adminUser.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        email: true,
        id: true,
        name: true,
        resetTokenExpiresAt: true,
        role: true,
      },
    });
  } catch {
    return [];
  }
}

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">
          Utilisateurs
        </h2>
        <p className="mt-2 text-zinc-400">
          Creez des comptes administrateurs et envoyez un lien de
          reinitialisation.
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Ajouter un utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <UserCreateForm />
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Comptes admin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {users.map((user) => (
              <section
                className="grid gap-4 rounded-md border border-zinc-800 bg-zinc-950 p-4 lg:grid-cols-[minmax(0,1fr)_260px]"
                key={user.id}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-[#ffc10a]/30 bg-[#ffc10a]/10 text-[#ffc10a]">
                    {user.role === "SUPER_ADMIN" ? (
                      <ShieldCheck className="h-5 w-5" />
                    ) : (
                      <UserRound className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-zinc-100">
                        {user.name}
                      </h3>
                      <Badge
                        className="border-[#ffc10a]/40 bg-[#ffc10a]/10 text-[#ffc10a]"
                        variant="outline"
                      >
                        {user.role === "SUPER_ADMIN"
                          ? "Super admin"
                          : "Admin"}
                      </Badge>
                      {user.resetTokenExpiresAt &&
                      user.resetTokenExpiresAt > new Date() ? (
                        <Badge
                          className="border-sky-400/40 bg-sky-400/10 text-sky-200"
                          variant="outline"
                        >
                          Lien actif
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-zinc-400">
                      {user.email}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Cree le {user.createdAt.toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <ResendResetForm userId={user.id} />
              </section>
            ))}

            {!users.length ? (
              <div className="rounded-md border border-zinc-800 bg-zinc-950 p-10 text-center text-sm text-zinc-500">
                Aucun utilisateur trouve.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
