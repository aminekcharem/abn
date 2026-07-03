import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { getPrisma } from "@/lib/prisma";
import { getShowroomSettings } from "@/lib/settings";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const brand = await getShowroomSettings();
  let pendingReviews = 0;

  try {
    const prisma = getPrisma();
    pendingReviews = await prisma.review.count({
      where: { isPublished: false },
    });
  } catch {
    pendingReviews = 0;
  }

  return (
    <AdminShell
      brand={brand}
      counts={{
        pendingPurchaseRequests: 0,
        pendingReviews,
        unreadMessages: 0,
      }}
      user={{
        email: session.user.email,
        name: session.user.name,
      }}
    >
      {children}
    </AdminShell>
  );
}
