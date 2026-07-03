import { FloatingContactBar } from "./_components/floating-contact-bar";
import { PublicFooter } from "./_components/public-footer";
import { getShowroomSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getShowroomSettings();

  return (
    <>
      {children}
      <FloatingContactBar settings={settings} />
      <PublicFooter settings={settings} />
    </>
  );
}
