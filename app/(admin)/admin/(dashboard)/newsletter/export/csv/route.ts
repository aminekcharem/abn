import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const prisma = getPrisma();
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });
  const rows = [
    ["Adresse e-mail", "Date d'inscription", "Derniere mise a jour"],
    ...subscribers.map((subscriber) => [
      subscriber.email,
      formatDate(subscriber.createdAt),
      formatDate(subscriber.updatedAt),
    ]),
  ];
  const csv = `\uFEFF${rows
    .map((row) => row.map(csvCell).join(";"))
    .join("\r\n")}`;

  return new Response(csv, {
    headers: {
      "Content-Disposition": 'attachment; filename="newsletter-emails.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
