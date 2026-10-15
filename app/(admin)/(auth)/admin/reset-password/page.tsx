import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getShowroomSettings } from "@/lib/settings";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params?.token || "";
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
            <span className="mb-3 grid h-12 w-12 place-items-center rounded-md bg-[#a21d2f] text-sm font-semibold text-white">
              {settings.companyName.slice(0, 2).toUpperCase()}
            </span>
          )}
          <CardTitle>Reinitialisation</CardTitle>
          <CardDescription>
            Definissez un nouveau mot de passe administrateur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
              Lien de reinitialisation invalide.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
