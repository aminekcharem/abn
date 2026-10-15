import Link from "next/link";
import { Star } from "lucide-react";

import { PublicHeader } from "../_components/public-header";
import { getPrisma } from "@/lib/prisma";
import { getPublicBrandLinks } from "@/lib/public-navigation";
import { getShowroomSettings } from "@/lib/settings";

export const revalidate = 300;

type PublicReview = {
  firstName: string;
  id: string;
  isAnonymous: boolean;
  lastName: string;
  message: string;
  rating: number;
};

async function getReviews() {
  try {
    const prisma = getPrisma();

    return await prisma.review.findMany({
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      select: {
        firstName: true,
        id: true,
        isAnonymous: true,
        lastName: true,
        message: true,
        rating: true,
      },
      where: { isPublished: true },
    });
  } catch {
    return [];
  }
}

function displayName(review: PublicReview) {
  return review.isAnonymous
    ? "Client anonyme"
    : `${review.firstName} ${review.lastName.charAt(0).toUpperCase()}.`;
}

function averageRating(reviews: PublicReview[]) {
  if (!reviews.length) return "0.0";

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);

  return (total / reviews.length).toFixed(1);
}

export default async function ReviewsPage() {
  const [settings, reviews, brandLinks] = await Promise.all([
    getShowroomSettings(),
    getReviews(),
    getPublicBrandLinks(),
  ]);

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#1b1b1b]">
      <PublicHeader brandLinks={brandLinks} settings={settings} />

      <section className="border-b border-[#e7e7e7] bg-white px-4 py-14 sm:px-8 lg:py-18">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-[#1b1b1b]/45">
              Avis clients
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Les retours de nos clients
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#1b1b1b]/62">
              Consultez les avis validés par notre équipe et partagez votre
              expérience avec le showroom.
            </p>
            <Link
              className="mt-7 inline-flex rounded-md bg-[#a21d2f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#111111]"
              href="/donner-un-avis"
            >
              Donner un avis
            </Link>
          </div>
          <div className="grid gap-3 rounded-md border border-[#ececec] bg-white p-6 shadow-[0_14px_36px_rgba(20,24,29,0.07)] sm:grid-cols-3">
            <div>
              <p className="text-4xl font-semibold">{averageRating(reviews)}</p>
              <p className="mt-1 text-sm font-semibold text-[#1b1b1b]/55">
                Note moyenne
              </p>
            </div>
            <div>
              <p className="text-4xl font-semibold">{reviews.length}</p>
              <p className="mt-1 text-sm font-semibold text-[#1b1b1b]/55">
                Avis publiés
              </p>
            </div>
            <div className="flex items-center gap-1 text-[#a21d2f]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star className="h-5 w-5 fill-current" key={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <article
              className="rounded-md border border-[#ececec] bg-white p-6 shadow-[0_10px_28px_rgba(20,24,29,0.05)]"
              key={review.id}
            >
              <div className="flex gap-1 text-[#a21d2f]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    className={
                      index < review.rating
                        ? "h-4 w-4 fill-current"
                        : "h-4 w-4 text-[#1b1b1b]/15"
                    }
                    key={index}
                  />
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-[#1b1b1b]/68">
                {review.message}
              </p>
              <p className="mt-5 text-xs font-semibold uppercase text-[#1b1b1b]/45">
                {displayName(review)}
              </p>
            </article>
          ))}

          {!reviews.length ? (
            <div className="col-span-full rounded-md border border-[#1b1b1b]/10 bg-white p-10 text-center">
              <p className="font-semibold">Aucun avis publié pour le moment.</p>
              <Link
                className="mt-4 inline-flex rounded-md bg-[#a21d2f] px-5 py-2 text-sm font-semibold text-white"
                href="/donner-un-avis"
              >
                Écrire le premier avis
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

