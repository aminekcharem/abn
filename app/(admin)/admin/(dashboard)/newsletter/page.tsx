import Link from "next/link";
import { Download, FileSpreadsheet, MailCheck, Send, Trash2, Users } from "lucide-react";

import { deleteNewsletterSubscriberAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type NewsletterSubscriber = {
  createdAt: Date;
  email: string;
  id: string;
  updatedAt: Date;
};

async function getNewsletterSubscribers() {
  try {
    const prisma = getPrisma();

    return await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
}

function isToday(value: Date) {
  const now = new Date();

  return (
    value.getDate() === now.getDate() &&
    value.getMonth() === now.getMonth() &&
    value.getFullYear() === now.getFullYear()
  );
}

function latestDate(subscribers: NewsletterSubscriber[]) {
  return subscribers[0]?.createdAt ? formatDate(subscribers[0].createdAt) : "-";
}

export default async function AdminNewsletterPage() {
  const subscribers = await getNewsletterSubscribers();
  const todayCount = subscribers.filter((subscriber) =>
    isToday(subscriber.createdAt),
  ).length;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Newsletter</h2>
          <p className="mt-2 text-zinc-400">
            Liste des adresses e-mail envoyées depuis le formulaire newsletter du site public.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/newsletter/export/csv">
              <Download className="h-4 w-4" />
              CSV
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/newsletter/export/excel">
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Link>
          </Button>
          <Badge className="border-[#a21d2f]/40 bg-[#a21d2f]/10 text-[#a21d2f]" variant="outline">
            {subscribers.length} inscrit{subscribers.length > 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total emails"
          value={String(subscribers.length)}
        />
        <StatCard
          icon={MailCheck}
          label="Aujourd'hui"
          value={String(todayCount)}
        />
        <StatCard icon={Send} label="Dernier email" value={latestDate(subscribers)} />
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Emails newsletter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border border-zinc-800">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="bg-zinc-950 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Adresse e-mail</th>
                  <th className="px-4 py-3 font-semibold">Date d&apos;inscription</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {subscribers.map((subscriber) => (
                  <tr className="bg-zinc-900 text-zinc-300" key={subscriber.id}>
                    <td className="px-4 py-4 font-medium text-zinc-100">
                      {subscriber.email}
                    </td>
                    <td className="px-4 py-4 text-zinc-400">
                      {formatDate(subscriber.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <Badge className="border-[#a21d2f]/40 bg-[#a21d2f]/10 text-[#a21d2f]" variant="outline">
                        Inscrit
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <form action={deleteNewsletterSubscriberAction}>
                        <input name="id" type="hidden" value={subscriber.id} />
                        <Button size="sm" type="submit" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!subscribers.length ? (
              <div className="bg-zinc-950 p-10 text-center text-sm text-zinc-500">
                Aucun email newsletter pour le moment.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardContent className="flex items-center gap-4 p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-[#a21d2f]/30 bg-[#a21d2f]/10 text-[#a21d2f]">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="mt-1 truncate text-xl font-semibold text-zinc-100">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
