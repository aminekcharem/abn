import { FloatingContactBar } from "./_components/floating-contact-bar";
import { PublicFooter } from "./_components/public-footer";
import { PublicTranslationProvider } from "./_components/public-translation-provider";
import { ScrollToTopButton } from "./_components/scroll-to-top-button";
import { getShowroomSettings } from "@/lib/settings";
import { getPublicTranslations } from "@/lib/translations";

export const revalidate = 300;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, translations] = await Promise.all([
    getShowroomSettings(),
    getPublicTranslations(),
  ]);

  return (
    <PublicTranslationProvider translations={translations}>
      {children}
      <FloatingContactBar settings={settings} />
      <ScrollToTopButton />
      <PublicFooter settings={settings} />
    </PublicTranslationProvider>
  );
}
