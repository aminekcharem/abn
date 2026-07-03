import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getShowroomSettings } from "@/lib/settings";
import { AdminLoginForm } from "./login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const settings = await getShowroomSettings();
  const authLogoUrl = settings.authLogoUrl || settings.logoUrl;

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 px-5 py-12 text-zinc-50">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900">
        <CardHeader className="items-center text-center">
          {authLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={settings.companyName}
              className="mb-3 max-h-14 max-w-56 object-contain"
              src={authLogoUrl}
            />
          ) : (
            <span className="mb-3 grid h-12 w-12 place-items-center rounded-md bg-[#ffc10a] text-sm font-semibold text-[#050b20]">
              {settings.companyName.slice(0, 2).toUpperCase()}
            </span>
          )}
          <CardTitle>Connexion admin</CardTitle>
          <CardDescription>
            Acces reserve a l&apos;administration du showroom.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm initialError={params?.error} />
        </CardContent>
      </Card>
    </main>
  );
}
