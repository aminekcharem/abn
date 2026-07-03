import { getPrisma } from "@/lib/prisma";

export type HomepageHeroSlide = {
  imagePath: string | null;
  vehicleId: string;
};

export type HomepageWhyChooseItem = {
  text: string;
  title: string;
};

export type HomepageFaqItem = {
  answer: string;
  question: string;
};

export type HomepageSettingsView = {
  aboutText: string;
  aboutTitle: string;
  categoryOrder: string[];
  faqItems: HomepageFaqItem[];
  featuredVehicleIds: string[];
  heroSlides: HomepageHeroSlide[];
  showFaqs: boolean;
  showReviews: boolean;
  spotlightDescription: string;
  spotlightTitle: string;
  spotlightVehicleId: string | null;
  whyChooseUsItems: HomepageWhyChooseItem[];
  whyChooseUsTitle: string;
};

export const defaultWhyChooseItems: HomepageWhyChooseItem[] = [
  {
    text: "Des solutions claires pour réserver ou acheter le véhicule adapté.",
    title: "Offres de financement",
  },
  {
    text: "Chaque annonce garde ses informations techniques et commerciales au même endroit.",
    title: "Showroom vérifié",
  },
  {
    text: "Prix, statut, kilométrage et disponibilité visibles dès le premier contact.",
    title: "Prix transparents",
  },
  {
    text: "Suivi commercial depuis le backoffice pour traiter les demandes rapidement.",
    title: "Service expert",
  },
];

export const defaultFaqItems: HomepageFaqItem[] = [
  {
    answer:
      "Les véhicules visibles sur le site sont synchronisés avec le showroom. Notre équipe confirme la disponibilité avant chaque réservation ou achat.",
    question: "Est-ce que tous les véhicules affichés sont disponibles ?",
  },
  {
    answer:
      "Vous pouvez comparer les prix, les options, le kilométrage et le statut directement depuis la page d'accueil, puis demander un accompagnement commercial.",
    question: "Comment choisir le véhicule adapté à mon budget ?",
  },
  {
    answer:
      "Oui, le formulaire de demande permet de signaler votre intérêt. Un conseiller vous recontacte pour valider les prochaines étapes.",
    question: "Puis-je réserver une voiture avant de venir au showroom ?",
  },
  {
    answer:
      "Chaque annonce garde ses données principales dans le backoffice afin de présenter des informations claires et cohérentes sur le site.",
    question: "Les informations techniques sont-elles vérifiées ?",
  },
];

export const defaultHomepageSettings: HomepageSettingsView = {
  aboutText:
    "Sélectionnez les véhicules, les visuels et les textes de la page d'accueil depuis cette configuration.",
  aboutTitle: "AutoPro Showroom",
  categoryOrder: [],
  faqItems: defaultFaqItems,
  featuredVehicleIds: [],
  heroSlides: [],
  showFaqs: true,
  showReviews: true,
  spotlightDescription:
    "Mettez en avant une voiture, un service ou une offre spéciale directement depuis le backoffice.",
  spotlightTitle: "Achetez avec confiance",
  spotlightVehicleId: null,
  whyChooseUsItems: defaultWhyChooseItems,
  whyChooseUsTitle: "Pourquoi nous choisir ?",
};

type HomepageSettingsRecord = {
  aboutText: string;
  aboutTitle: string;
  categoryOrder: unknown;
  faqItems: unknown;
  featuredVehicleIds: unknown;
  heroSlides: unknown;
  showFaqs: boolean;
  showReviews: boolean;
  spotlightDescription: string;
  spotlightTitle: string;
  spotlightVehicleId: string | null;
  whyChooseUsItems: unknown;
  whyChooseUsTitle: string;
};

type HomepageSettingsDelegate = {
  upsert: (args: {
    create: HomepageSettingsView & { id: string };
    update: Record<string, never>;
    where: { id: string };
  }) => Promise<HomepageSettingsRecord>;
};

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is string => typeof item === "string");
}

function asHeroSlides(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const slide = item as Record<string, unknown>;
      const vehicleId = slide.vehicleId;
      const imagePath = slide.imagePath;

      if (typeof vehicleId !== "string" || !vehicleId) return null;

      return {
        imagePath: typeof imagePath === "string" && imagePath ? imagePath : null,
        vehicleId,
      };
    })
    .filter((item): item is HomepageHeroSlide => Boolean(item))
    .slice(0, 5);
}

function asWhyChooseItems(value: unknown) {
  if (!Array.isArray(value)) return defaultWhyChooseItems;

  const items = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const reason = item as Record<string, unknown>;
      const title = reason.title;
      const text = reason.text;

      if (typeof title !== "string" || typeof text !== "string") return null;
      if (!title.trim() || !text.trim()) return null;

      return { text: text.trim(), title: title.trim() };
    })
    .filter((item): item is HomepageWhyChooseItem => Boolean(item))
    .slice(0, 4);

  return items.length ? items : defaultWhyChooseItems;
}

function asFaqItems(value: unknown) {
  if (!Array.isArray(value)) return defaultFaqItems;

  const items = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const faq = item as Record<string, unknown>;
      const answer = faq.answer;
      const question = faq.question;

      if (typeof answer !== "string" || typeof question !== "string") return null;
      if (!answer.trim() || !question.trim()) return null;

      return { answer: answer.trim(), question: question.trim() };
    })
    .filter((item): item is HomepageFaqItem => Boolean(item))
    .slice(0, 12);

  return items.length ? items : defaultFaqItems;
}

function getHomepageSettingsDelegate() {
  const prisma = getPrisma() as ReturnType<typeof getPrisma> & {
    homepageSettings?: HomepageSettingsDelegate;
  };

  return prisma.homepageSettings;
}

function normalizeHomepageSettings(
  settings: HomepageSettingsRecord,
): HomepageSettingsView {
  return {
    aboutText: settings.aboutText || defaultHomepageSettings.aboutText,
    aboutTitle: settings.aboutTitle || defaultHomepageSettings.aboutTitle,
    categoryOrder: asStringArray(settings.categoryOrder),
    faqItems: asFaqItems(settings.faqItems),
    featuredVehicleIds: asStringArray(settings.featuredVehicleIds),
    heroSlides: asHeroSlides(settings.heroSlides),
    showFaqs: settings.showFaqs,
    showReviews: settings.showReviews,
    spotlightDescription:
      settings.spotlightDescription ||
      defaultHomepageSettings.spotlightDescription,
    spotlightTitle:
      settings.spotlightTitle || defaultHomepageSettings.spotlightTitle,
    spotlightVehicleId: settings.spotlightVehicleId,
    whyChooseUsItems: asWhyChooseItems(settings.whyChooseUsItems),
    whyChooseUsTitle:
      !settings.whyChooseUsTitle || settings.whyChooseUsTitle === "Why Choose Us?"
        ? defaultHomepageSettings.whyChooseUsTitle
        : settings.whyChooseUsTitle,
  };
}

export async function getHomepageSettings(): Promise<HomepageSettingsView> {
  try {
    const homepageSettings = getHomepageSettingsDelegate();

    if (!homepageSettings) {
      return defaultHomepageSettings;
    }

    const settings = await homepageSettings.upsert({
      create: {
        ...defaultHomepageSettings,
        id: "main",
      },
      update: {},
      where: { id: "main" },
    });

    return normalizeHomepageSettings(settings);
  } catch {
    return defaultHomepageSettings;
  }
}
