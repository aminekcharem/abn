import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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
  const bodyRows = subscribers
    .map(
      (subscriber) => `
        <tr>
          <td>${escapeHtml(subscriber.email)}</td>
          <td>${escapeHtml(formatDate(subscriber.createdAt))}</td>
          <td>${escapeHtml(formatDate(subscriber.updatedAt))}</td>
        </tr>`,
    )
    .join("");
  const workbook = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <table>
      <thead>
        <tr>
          <th>Adresse e-mail</th>
          <th>Date d'inscription</th>
          <th>Derniere mise a jour</th>
        </tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </body>
</html>`;

  return new Response(workbook, {
    headers: {
      "Content-Disposition": 'attachment; filename="newsletter-emails.xls"',
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
    },
  });
}
