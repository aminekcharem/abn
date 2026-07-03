"use client";

import { useActionState, useState } from "react";
import {
  Building2,
  Globe2,
  ImagePlus,
  Images,
  KeyRound,
  Loader2,
  Mail,
  Moon,
  Phone,
  Save,
  Sun,
  Camera,
  ThumbsUp,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  type SettingsActionState,
  updateShowroomSettings,
} from "./actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ShowroomSettingsView } from "@/lib/settings";

export type LogoMediaOption = {
  height: number | null;
  id: string;
  localPath: string;
  name: string;
  previewUrl: string;
  width: number | null;
};

const initialState: SettingsActionState = {
  ok: false,
  message: "",
};

export function SettingsForm({
  mediaOptions,
  settings,
}: {
  mediaOptions: LogoMediaOption[];
  settings: ShowroomSettingsView;
}) {
  const [state, formAction, isPending] = useActionState(
    updateShowroomSettings,
    initialState,
  );
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(settings.logoUrl);
  const [websiteLogoPreviewUrl, setWebsiteLogoPreviewUrl] = useState(
    settings.websiteLogoUrl || settings.logoUrl,
  );
  const [authLogoPreviewUrl, setAuthLogoPreviewUrl] = useState(
    settings.authLogoUrl || settings.logoUrl,
  );

  return (
    <form action={formAction} className="grid gap-6">
      {state.message ? (
        <div
          className={
            state.ok
              ? "rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
              : "rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          }
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-zinc-200">
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#ffc10a]" />
              Nom de l&apos;entreprise
            </span>
            <input
              className={inputClass}
              defaultValue={settings.companyName}
              maxLength={80}
              name="companyName"
              placeholder="AutoPro Showroom"
              required
            />
            {state.fieldErrors?.companyName ? (
              <span className="text-xs text-red-300">
                {state.fieldErrors.companyName[0]}
              </span>
            ) : null}
          </label>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#ffc10a]" />
                Telephone public
              </span>
              <input
                className={inputClass}
                defaultValue={settings.contactPhone}
                maxLength={40}
                name="contactPhone"
                placeholder="+216 00 000 000"
                required
              />
              {state.fieldErrors?.contactPhone ? (
                <span className="text-xs text-red-300">
                  {state.fieldErrors.contactPhone[0]}
                </span>
              ) : null}
            </label>

            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#ffc10a]" />
                E-mail public
              </span>
              <input
                className={inputClass}
                defaultValue={settings.contactEmail}
                maxLength={120}
                name="contactEmail"
                placeholder="contact@autopro.test"
                required
                type="email"
              />
              {state.fieldErrors?.contactEmail ? (
                <span className="text-xs text-red-300">
                  {state.fieldErrors.contactEmail[0]}
                </span>
              ) : null}
            </label>
          </div>

          <div className="grid gap-4 rounded-md border border-zinc-800 bg-zinc-950 p-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              <span className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-[#ffc10a]" />
                Lien Facebook
              </span>
              <input
                className={inputClass}
                defaultValue={settings.facebookUrl || ""}
                maxLength={240}
                name="facebookUrl"
                placeholder="https://facebook.com/..."
                type="url"
              />
              {state.fieldErrors?.facebookUrl ? (
                <span className="text-xs text-red-300">
                  {state.fieldErrors.facebookUrl[0]}
                </span>
              ) : null}
            </label>

            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              <span className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-[#ffc10a]" />
                Lien Instagram
              </span>
              <input
                className={inputClass}
                defaultValue={settings.instagramUrl || ""}
                maxLength={240}
                name="instagramUrl"
                placeholder="https://instagram.com/..."
                type="url"
              />
              {state.fieldErrors?.instagramUrl ? (
                <span className="text-xs text-red-300">
                  {state.fieldErrors.instagramUrl[0]}
                </span>
              ) : null}
            </label>
          </div>

          <div className="grid gap-2 text-sm font-medium text-zinc-200">
            <span className="flex items-center gap-2">
              {settings.showFloatingBar ? (
                <Eye className="h-4 w-4 text-[#ffc10a]" />
              ) : (
                <EyeOff className="h-4 w-4 text-[#ffc10a]" />
              )}
              Barre d&apos;icones fixe du site
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex h-11 items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200">
                <input
                  className="accent-primary"
                  defaultChecked={settings.showFloatingBar}
                  name="showFloatingBar"
                  type="radio"
                  value="true"
                />
                <Eye className="h-4 w-4" />
                Afficher
              </label>
              <label className="flex h-11 items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200">
                <input
                  className="accent-primary"
                  defaultChecked={!settings.showFloatingBar}
                  name="showFloatingBar"
                  type="radio"
                  value="false"
                />
                <EyeOff className="h-4 w-4" />
                Cacher
              </label>
            </div>
          </div>

          <LogoPicker
            currentPath={settings.logoPath}
            currentUrl={settings.logoUrl}
            description="Utilise dans la navigation du backoffice."
            fileName="logo"
            icon={<ImagePlus className="h-4 w-4 text-[#ffc10a]" />}
            mediaFieldName="logoMediaPath"
            mediaOptions={mediaOptions}
            onPreviewChange={setLogoPreviewUrl}
            title="Logo du backoffice"
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <LogoPicker
              currentPath={settings.websiteLogoPath}
              currentUrl={settings.websiteLogoUrl}
              description="Utilise dans l'en-tete public du showroom."
              fileName="websiteLogo"
              icon={<Globe2 className="h-4 w-4 text-[#ffc10a]" />}
              mediaFieldName="websiteLogoMediaPath"
              mediaOptions={mediaOptions}
              onPreviewChange={(url) =>
                setWebsiteLogoPreviewUrl(url || settings.logoUrl)
              }
              title="Logo du site web"
            />

            <LogoPicker
              currentPath={settings.authLogoPath}
              currentUrl={settings.authLogoUrl}
              description="Affiche sur la page de connexion admin."
              fileName="authLogo"
              icon={<KeyRound className="h-4 w-4 text-[#ffc10a]" />}
              mediaFieldName="authLogoMediaPath"
              mediaOptions={mediaOptions}
              onPreviewChange={(url) =>
                setAuthLogoPreviewUrl(url || settings.logoUrl)
              }
              title="Logo authentification"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              Largeur d&apos;affichage
              <input
                className={inputClass}
                defaultValue={settings.logoWidth}
                max={420}
                min={80}
                name="logoWidth"
                type="number"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              Hauteur d&apos;affichage
              <input
                className={inputClass}
                defaultValue={settings.logoHeight}
                max={160}
                min={24}
                name="logoHeight"
                type="number"
              />
            </label>
          </div>

          <div className="grid gap-2 text-sm font-medium text-zinc-200">
            <span className="flex items-center gap-2">
              {settings.adminTheme === "LIGHT" ? (
                <Sun className="h-4 w-4 text-[#ffc10a]" />
              ) : (
                <Moon className="h-4 w-4 text-[#ffc10a]" />
              )}
              Mode du backoffice
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex h-11 items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200">
                <input
                  className="accent-primary"
                  defaultChecked={settings.adminTheme === "DARK"}
                  name="adminTheme"
                  type="radio"
                  value="DARK"
                />
                <Moon className="h-4 w-4" />
                Sombre
              </label>
              <label className="flex h-11 items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200">
                <input
                  className="accent-primary"
                  defaultChecked={settings.adminTheme === "LIGHT"}
                  name="adminTheme"
                  type="radio"
                  value="LIGHT"
                />
                <Sun className="h-4 w-4" />
                Clair
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
          <p className="mb-3 text-xs font-semibold uppercase text-zinc-500">
            Apercu backoffice
          </p>
          <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-md bg-[#0F0F0F] p-4 text-center">
            {logoPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="max-h-12 max-w-full object-contain"
                height={settings.logoHeight}
                src={logoPreviewUrl}
                width={settings.logoWidth}
              />
            ) : (
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#ffc10a] text-sm font-semibold text-[#050b20]">
                {settings.companyName.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 max-w-full">
              <p className="truncate text-sm font-semibold text-zinc-100">
                {settings.companyName}
              </p>
              <p className="text-xs text-zinc-500">Administration</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <LogoPreview
              label="Site web"
              logoUrl={websiteLogoPreviewUrl}
              name={settings.companyName}
              surfaceClassName="bg-white text-[#050b20]"
            />
            <LogoPreview
              label="Authentification"
              logoUrl={authLogoPreviewUrl}
              name={settings.companyName}
              surfaceClassName="bg-zinc-900 text-zinc-50"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button disabled={isPending} type="submit">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}

const inputClass =
  "h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4";

const fileInputClass =
  "rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none file:mr-4 file:rounded-md file:border-0 file:bg-[#ffc10a] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#050b20] focus:ring-4 focus:ring-primary/30";

function LogoPicker({
  currentPath,
  currentUrl,
  description,
  fileName,
  icon,
  mediaFieldName,
  mediaOptions,
  onPreviewChange,
  title,
}: {
  currentPath: string | null;
  currentUrl: string | null;
  description: string;
  fileName: string;
  icon: React.ReactNode;
  mediaFieldName: string;
  mediaOptions: LogoMediaOption[];
  onPreviewChange: (url: string | null) => void;
  title: string;
}) {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState(currentPath || "");
  const [selectedName, setSelectedName] = useState(
    mediaOptions.find((asset) => asset.localPath === currentPath)?.name ||
      (currentUrl ? "Logo actuel" : "Aucun media selectionne"),
  );
  const currentMediaIsVisible = mediaOptions.some(
    (asset) => asset.localPath === currentPath,
  );

  return (
    <div className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-950 p-4">
      <input name={mediaFieldName} type="hidden" value={selectedPath} />

      <div className="grid gap-1 text-sm font-medium text-zinc-200">
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        <span className="text-xs font-normal text-zinc-500">{description}</span>
      </div>

      <div className="grid gap-2 rounded-md border border-zinc-800 bg-black p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Media selectionne
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-zinc-200">
              {selectedName}
            </p>
          </div>
          <Dialog open={isMediaOpen} onOpenChange={setIsMediaOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                <Images className="h-4 w-4" />
                Choisir depuis Media
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>
                  Selectionnez une image deja presente dans la bibliotheque Media.
                </DialogDescription>
              </DialogHeader>

              <div className="min-h-0 overflow-y-auto pr-1">
                {mediaOptions.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <button
                      className="flex min-h-28 cursor-pointer items-center gap-3 rounded-md border border-zinc-800 bg-black px-3 py-2 text-left text-xs text-zinc-300 transition hover:border-[#ffc10a]/60"
                      onClick={() => {
                        setSelectedPath("");
                        setSelectedName(
                          currentUrl ? "Logo actuel" : "Aucun media selectionne",
                        );
                        onPreviewChange(currentUrl);
                        setIsMediaOpen(false);
                      }}
                      type="button"
                    >
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-zinc-900 text-zinc-500">
                        <Images className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-semibold text-zinc-200">
                          Conserver le logo actuel
                        </span>
                        <span className="mt-1 block text-zinc-500">
                          Ne change pas ce logo.
                        </span>
                      </span>
                    </button>

                    {mediaOptions.map((asset) => {
                      const isSelected =
                        selectedPath === asset.localPath ||
                        (!selectedPath &&
                          currentMediaIsVisible &&
                          asset.localPath === currentPath);

                      return (
                        <button
                          className={
                            isSelected
                              ? "grid cursor-pointer grid-cols-[72px_1fr] items-center gap-3 rounded-md border border-[#ffc10a] bg-[#ffc10a]/10 p-3 text-left text-xs text-zinc-300"
                              : "grid cursor-pointer grid-cols-[72px_1fr] items-center gap-3 rounded-md border border-zinc-800 bg-black p-3 text-left text-xs text-zinc-300 transition hover:border-[#ffc10a]/60"
                          }
                          key={`${mediaFieldName}-${asset.id}`}
                          onClick={() => {
                            setSelectedPath(asset.localPath);
                            setSelectedName(asset.name);
                            onPreviewChange(asset.previewUrl);
                            setIsMediaOpen(false);
                          }}
                          type="button"
                        >
                          <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-md bg-zinc-900">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt=""
                              className="max-h-full max-w-full object-contain"
                              src={asset.previewUrl}
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-zinc-200">
                              {asset.name}
                            </span>
                            {asset.width && asset.height ? (
                              <span className="mt-1 block text-zinc-500">
                                {asset.width} x {asset.height}px
                              </span>
                            ) : (
                              <span className="mt-1 block text-zinc-500">
                                SVG ou image
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-md border border-zinc-800 bg-black p-8 text-center text-sm text-zinc-500">
                    Aucun media disponible. Ajoutez d&apos;abord une image dans le
                    module Media.
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Fermer
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <label className="grid gap-2 text-xs font-medium text-zinc-300">
        Ou telecharger un nouveau fichier
        <input
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className={fileInputClass}
          name={fileName}
          type="file"
        />
      </label>
    </div>
  );
}

function LogoPreview({
  label,
  logoUrl,
  name,
  surfaceClassName,
}: {
  label: string;
  logoUrl: string | null;
  name: string;
  surfaceClassName: string;
}) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
      <p className="mb-2 text-xs font-semibold uppercase text-zinc-500">
        Apercu {label}
      </p>
      <div
        className={`flex min-h-16 items-center justify-center rounded-md p-4 ${surfaceClassName}`}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="max-h-10 max-w-full object-contain" src={logoUrl} />
        ) : (
          <span className="text-sm font-semibold">{name}</span>
        )}
      </div>
    </div>
  );
}
