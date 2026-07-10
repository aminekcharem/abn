"use client";

import { useActionState, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, UploadCloud } from "lucide-react";

import { uploadMediaAssets, type MediaActionState } from "./actions";
import { MAX_MEDIA_FILE_SIZE_MB, MAX_MEDIA_FILES } from "./constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initialState: MediaActionState = {
  message: "",
  ok: false,
};

const maxFileSizeBytes = MAX_MEDIA_FILE_SIZE_MB * 1024 * 1024;

type SelectedFileSummary = {
  name: string;
  size: number;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export function MediaUploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileSummary[]>([]);
  const [clientError, setClientError] = useState("");
  const [state, formAction, isPending] = useActionState(
    async (previousState: MediaActionState, formData: FormData) => {
      const nextState = await uploadMediaAssets(previousState, formData);

      if (nextState.ok) {
        setSelectedFiles([]);
        setClientError("");

        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }

      return nextState;
    },
    initialState,
  );
  const selectedFilesCount = selectedFiles.length;
  const hasSelectedFiles = selectedFilesCount > 0;

  function updateSelectedFiles(files: FileList | null) {
    const nextFiles = Array.from(files ?? []);
    const oversizedFile = nextFiles.find((file) => file.size > maxFileSizeBytes);

    if (nextFiles.length > MAX_MEDIA_FILES) {
      setSelectedFiles([]);
      setClientError(`Maximum ${MAX_MEDIA_FILES} images par envoi.`);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    if (oversizedFile) {
      setSelectedFiles([]);
      setClientError(
        `"${oversizedFile.name}" depasse ${MAX_MEDIA_FILE_SIZE_MB} Mo. Selectionnez des fichiers plus legers.`,
      );

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    setClientError("");
    setSelectedFiles(
      nextFiles.map((file) => ({
        name: file.name,
        size: file.size,
      })),
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      {state.message ? (
        <div
          className={cn(
            "rounded-md border px-4 py-3 text-sm",
            state.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-[#ffc10a]/40 bg-[#ffc10a]/10 text-[#ffc10a]",
          )}
        >
          {state.message}
        </div>
      ) : null}

      {clientError ? (
        <div className="rounded-md border border-[#ffc10a]/40 bg-[#ffc10a]/10 px-4 py-3 text-sm text-[#ffc10a]">
          {clientError}
        </div>
      ) : null}

      <div className="rounded-md border border-dashed border-zinc-700 bg-zinc-950 p-5 text-center">
        <ImagePlus className="mx-auto h-8 w-8 text-zinc-500" />
        <p className="mt-2 text-sm font-medium text-zinc-200">
          Ajoutez les images du site
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Selection multiple autorisee jusqu&apos;a {MAX_MEDIA_FILES} images. Maximum{" "}
          {MAX_MEDIA_FILE_SIZE_MB} Mo par fichier. PNG, JPG et JPEG sont convertis en
          WebP.
        </p>
        <input
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          multiple
          name="files"
          onChange={(event) => {
            updateSelectedFiles(event.target.files);
          }}
          ref={inputRef}
          type="file"
        />
        <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
          <Button
            className={cn(
              hasSelectedFiles &&
                "border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15 hover:text-emerald-100",
            )}
            onClick={() => inputRef.current?.click()}
            type="button"
            variant="outline"
          >
            {hasSelectedFiles ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {hasSelectedFiles
              ? `${selectedFilesCount} image${selectedFilesCount > 1 ? "s" : ""} selectionnee${selectedFilesCount > 1 ? "s" : ""}`
              : "Selectionner"}
          </Button>
          <Button disabled={isPending || !hasSelectedFiles} type="submit">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            Envoyer
          </Button>
        </div>
        {hasSelectedFiles ? (
          <div className="mt-4 rounded-md border border-zinc-800 bg-black p-3 text-left">
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Fichiers prets a envoyer
            </p>
            <ul className="mt-2 grid gap-1 text-xs text-zinc-300">
              {selectedFiles.slice(0, 6).map((file) => (
                <li
                  className="flex items-center justify-between gap-3"
                  key={`${file.name}-${file.size}`}
                >
                  <span className="min-w-0 truncate">{file.name}</span>
                  <span className="shrink-0 text-zinc-500">
                    {formatFileSize(file.size)}
                  </span>
                </li>
              ))}
            </ul>
            {selectedFiles.length > 6 ? (
              <p className="mt-2 text-xs text-zinc-500">
                +{selectedFiles.length - 6} autre
                {selectedFiles.length - 6 > 1 ? "s" : ""} fichier
                {selectedFiles.length - 6 > 1 ? "s" : ""}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-950 p-4">
        <label className="grid gap-1 text-xs font-medium text-zinc-300">
          Alt par defaut
          <input
            className={inputClass}
            maxLength={191}
            name="alt"
            placeholder="Description courte pour l'accessibilite"
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-zinc-300">
          Title par defaut
          <input
            className={inputClass}
            maxLength={191}
            name="title"
            placeholder="Titre de l'image"
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-zinc-300">
          Caption par defaut
          <textarea
            className="min-h-20 rounded-md border border-zinc-800 bg-black px-3 py-2 text-xs text-zinc-100 outline-none ring-primary/30 transition focus:ring-4"
            maxLength={1000}
            name="caption"
            placeholder="Legende descriptive"
          />
        </label>
      </div>
    </form>
  );
}

const inputClass =
  "h-9 rounded-md border border-zinc-800 bg-black px-3 text-xs text-zinc-100 outline-none ring-primary/30 transition focus:ring-4";
