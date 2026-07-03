import Link from "next/link";
import { Star } from "lucide-react";

import { ReviewForm } from "./review-form";
import { PublicHeader } from "../_components/public-header";
import { getShowroomSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function GiveReviewPage() {
  const settings = await getShowroomSettings();

  return (
    <main className="min-h-screen bg-white text-[#1b1b1b]">
      <PublicHeader settings={settings} />

      <section className="px-4 py-14 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase text-[#1b1b1b]/45">
              Donner un avis
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Partagez votre expérience
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#1b1b1b]/62">
              Votre avis aide les prochains clients a mieux connaitre notre
              service. Vous pouvez choisir d&apos;afficher votre nom ou de rester
              anonyme sur le site.
            </p>
            <div className="mt-7 flex gap-1 text-[#ffc10a]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star className="h-5 w-5 fill-current" key={index} />
              ))}
            </div>
            <Link
              className="mt-8 inline-flex text-sm font-semibold text-[#1b1b1b] underline decoration-[#ffc10a] underline-offset-8"
              href="/"
            >
              Retour à l&apos;accueil
            </Link>
          </div>

          <ReviewForm />
        </div>
      </section>
    </main>
  );
}
