import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getShowroomSettings } from "@/lib/settings";
import { ForgotPasswordForm } from "./forgot-password-form";

export default async function ForgotPasswordPage() {
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
          <CardTitle>Mot de passe oublie</CardTitle>
          <CardDescription>
            Saisissez votre email pour recevoir un lien de reinitialisation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}
