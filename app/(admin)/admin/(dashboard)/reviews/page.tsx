import { MessageSquareText, Star } from "lucide-react";

import {
  deleteReviewAction,
  toggleReviewAnonymousAction,
  toggleReviewPublishedAction,
  updateReviewAction,
} from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getReviews() {
  try {
    const prisma = getPrisma();

    return await prisma.review.findMany({
      orderBy: [{ isPublished: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    return [];
  }
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
}

function displayName(review: {
  firstName: string;
  isAnonymous: boolean;
  lastName: string;
}) {
  return review.isAnonymous
    ? "Client anonyme"
    : `${review.firstName} ${review.lastName}`;
}

export default async function AdminReviewsPage() {
  const reviews = await getReviews();
  const publishedCount = reviews.filter((review) => review.isPublished).length;
  const pendingCount = reviews.length - publishedCount;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Avis</h2>
          <p className="mt-2 text-zinc-400">
            Validez les avis clients avant leur affichage sur la home et la page
            publique des avis.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="border-[#a21d2f]/40 bg-[#a21d2f]/10 text-[#a21d2f]" variant="outline">
            {publishedCount} publie
          </Badge>
          <Badge className="border-zinc-700 bg-zinc-800 text-zinc-300" variant="outline">
            {pendingCount} en attente
          </Badge>
        </div>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Liste des avis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {reviews.map((review) => (
              <section
                className="rounded-md border border-zinc-800 bg-zinc-950 p-4"
                key={review.id}
              >
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_460px]">
                  <div>
                    <div className="flex items-start gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-[#a21d2f]/30 bg-[#a21d2f]/10 text-[#a21d2f]">
                        <MessageSquareText className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-zinc-100">
                            {displayName(review)}
                          </h3>
                          <Badge
                            className={
                              review.isPublished
                                ? "border-[#a21d2f]/40 bg-[#a21d2f]/10 text-[#a21d2f]"
                                : "border-zinc-700 bg-zinc-800 text-zinc-400"
                            }
                            variant="outline"
                          >
                            {review.isPublished ? "Publie" : "Non publie"}
                          </Badge>
                          {review.isAnonymous ? (
                            <Badge className="border-zinc-700 bg-zinc-900 text-zinc-300" variant="outline">
                              Anonyme
                            </Badge>
                          ) : null}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                          <span>{formatDate(review.createdAt)}</span>
                          <span className="flex items-center gap-1 text-[#a21d2f]">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                className={
                                  index < review.rating
                                    ? "h-3.5 w-3.5 fill-current"
                                    : "h-3.5 w-3.5 text-zinc-700"
                                }
                                key={index}
                              />
                            ))}
                          </span>
                        </div>
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300">
                          {review.message}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <form action={toggleReviewPublishedAction}>
                        <input name="id" type="hidden" value={review.id} />
                        <input
                          name="isPublished"
                          type="hidden"
                          value={review.isPublished ? "false" : "true"}
                        />
                        <Button size="sm" type="submit">
                          {review.isPublished ? "Retirer du site" : "Publier"}
                        </Button>
                      </form>
                      <form action={toggleReviewAnonymousAction}>
                        <input name="id" type="hidden" value={review.id} />
                        <input
                          name="isAnonymous"
                          type="hidden"
                          value={review.isAnonymous ? "false" : "true"}
                        />
                        <Button size="sm" type="submit" variant="secondary">
                          {review.isAnonymous ? "Afficher le nom" : "Rendre anonyme"}
                        </Button>
                      </form>
                      <form action={deleteReviewAction}>
                        <input name="id" type="hidden" value={review.id} />
                        <Button size="sm" type="submit" variant="destructive">
                          Supprimer
                        </Button>
                      </form>
                    </div>
                  </div>

                  <form
                    action={updateReviewAction.bind(null, review.id)}
                    className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-900 p-3"
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className={labelClass}>
                        Prenom
                        <input
                          className={inputClass}
                          defaultValue={review.firstName}
                          name="firstName"
                          required
                        />
                      </label>
                      <label className={labelClass}>
                        Nom
                        <input
                          className={inputClass}
                          defaultValue={review.lastName}
                          name="lastName"
                          required
                        />
                      </label>
                    </div>
                    <label className={labelClass}>
                      Etoiles
                      <select className={inputClass} defaultValue={review.rating} name="rating">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <option key={rating} value={rating}>
                            {rating}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={labelClass}>
                      Message
                      <textarea
                        className="min-h-28 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4"
                        defaultValue={review.message}
                        name="message"
                        required
                      />
                    </label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
                        <input
                          className="h-4 w-4 accent-primary"
                          defaultChecked={review.isAnonymous}
                          name="isAnonymous"
                          type="checkbox"
                        />
                        Anonyme
                      </label>
                      <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
                        <input
                          className="h-4 w-4 accent-primary"
                          defaultChecked={review.isPublished}
                          name="isPublished"
                          type="checkbox"
                        />
                        Publie
                      </label>
                    </div>
                    <Button
                      className="w-max bg-[#a21d2f] text-white hover:bg-[#050b20] hover:text-white"
                      type="submit"
                    >
                      Enregistrer
                    </Button>
                  </form>
                </div>
              </section>
            ))}

            {!reviews.length ? (
              <div className="rounded-md border border-zinc-800 bg-zinc-950 p-10 text-center text-sm text-zinc-500">
                Aucun avis pour le moment.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const inputClass =
  "h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4";

const labelClass = "grid gap-2 text-sm font-medium text-zinc-200";

