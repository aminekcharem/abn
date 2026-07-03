import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const prisma = getPrisma();
    const [unreadMessages, pendingPurchaseRequests, pendingReviews] = await Promise.all([
      prisma.contactMessage.count({
        where: { isRead: false },
      }),
      prisma.purchaseRequest.count({
        where: { status: { not: "TRAITE" } },
      }),
      prisma.review.count({
        where: { isPublished: false },
      }),
    ]);

    return Response.json({
      unreadMessages,
      pendingPurchaseRequests,
      pendingReviews,
    });
  } catch {
    return Response.json({
      unreadMessages: 0,
      pendingPurchaseRequests: 0,
      pendingReviews: 0,
    });
  }
}
