"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Film,
  ImagePlus,
  Images,
  Link2,
  Loader2,
  Save,
  X,
  XCircle,
} from "lucide-react";

import { createVehicle, updateVehicle } from "./actions";
import { Button } from "@/components/ui/button";
import {
  initialVehicleActionState,
  type VehicleActionState,
} from "@/lib/validations/vehicle";
import { cn } from "@/lib/utils";

type SelectOption = {
  id: string;
  name: string;
};

type EquipmentOption = SelectOption & {
  category: {
    iconSvg: string | null;
    id: string;
    name: string;
    order: number;
  };
};

export type VehicleMediaLibraryAsset = {
  alt: string | null;
  id: string;
  localPath: string;
  originalName: string;
  title: string | null;
};

export type VehicleFormInitialData = {
  id?: string;
  title: string;
  slug: string;
  brandId: string;
  categoryId: string;
  model: string;
  generation: string;
  trim: string;
  engineCode: string;
  motorization: string;
  price: string;
  priceCurrency: "TND" | "EUR";
  year: string;
  firstRegistrationDate: string;
  status: "BROUILLON" | "DISPONIBLE" | "VENDU" | "RESERVE";
  isFeatured: boolean;
  isNew: boolean;
  power: string;
  displacement: string;
  engine: string;
  fuelType: "ESSENCE" | "DIESEL" | "HYBRIDE" | "ELECTRIQUE";
  transmission: string;
  gearbox: string;
  mileage: string;
  doors: string;
  seats: string;
  colorName: string;
  colorHex: string;
  registration: string;
  vin: string;
  optionIds: string[];
  images: string[];
  videos: string[];
  description: string;
};

type ImageItem =
  | { key: string; type: "existing"; url: string }
  | { key: string; type: "new"; url: string; file: File };

type VideoItem =
  | { key: string; type: "existing"; url: string }
  | { key: string; type: "new"; url: string; file: File };

type VehicleFormProps = {
  mode: "create" | "edit";
  brands: SelectOption[];
  categories: SelectOption[];
  mediaAssets: VehicleMediaLibraryAsset[];
  options: EquipmentOption[];
  initialData: VehicleFormInitialData;
};

const emptyActionState: VehicleActionState = initialVehicleActionState;
const MAX_VEHICLE_IMAGES = 100;
const MAX_VEHICLE_VIDEOS = 100;

const statusLabels = {
  BROUILLON: "Brouillon",
  DISPONIBLE: "Disponible",
  VENDU: "Vendu",
  RESERVE: "Reserve",
};

const fieldLabels: Record<string, string> = {
  brandId: "Marque",
  categoryId: "Categorie",
  colorHex: "Code couleur",
  colorName: "Couleur",
  description: "Description",
  displacement: "Cylindree",
  doors: "Nombre de portes",
  engine: "Type moteur",
  engineCode: "Code moteur",
  existingImages: "Images existantes",
  firstRegistrationDate: "Date de mise en circulation",
  fuelType: "Carburant",
  gearbox: "Boite de vitesses",
  generation: "Generation",
  images: "Images",
  videos: "Videos",
  isFeatured: "Mise en avant",
  isNew: "Nouveau",
  mileage: "Kilometrage",
  model: "Modele",
  motorization: "Motorisation",
  optionIds: "Options et equipements",
  power: "Puissance",
  price: "Prix",
  priceCurrency: "Devise du prix",
  registration: "Immatriculation",
  seats: "Nombre de places",
  slug: "Slug",
  status: "Statut",
  title: "Titre",
  transmission: "Transmission",
  trim: "Finition",
  vin: "VIN",
  year: "Annee",
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getFieldError(
  state: VehicleActionState,
  field: string,
): string | undefined {
  return state.fieldErrors?.[field]?.[0];
}

function getFieldErrorSummary(state: VehicleActionState) {
  return Object.entries(state.fieldErrors ?? {}).flatMap(([field, errors]) =>
    errors.map((error) => ({
      error,
      field,
      label: fieldLabels[field] ?? field,
    })),
  );
}

function getYouTubeVideoId(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      const videoId = url.searchParams.get("v");
      if (videoId) return videoId;

      const embedMatch = url.pathname.match(/\/(?:embed|shorts)\/([^/?#]+)/);
      return embedMatch?.[1] || "";
    }
  } catch {
    return "";
  }

  return "";
}

function isYouTubeUrl(value: string) {
  return Boolean(getYouTubeVideoId(value));
}

function getYouTubeEmbedUrl(value: string) {
  const videoId = getYouTubeVideoId(value);

  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
}

export function VehicleForm({
  brands,
  categories,
  initialData,
  mediaAssets,
  mode,
  options,
}: VehicleFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const action =
    mode === "edit" && initialData.id
      ? updateVehicle.bind(null, initialData.id)
      : createVehicle;
  const [state, formAction] = useActionState(action, emptyActionState);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialData.slug));
  const [slug, setSlug] = useState(initialData.slug);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [images, setImages] = useState<ImageItem[]>(
    initialData.images.map((url) => ({
      key: `existing-${url}`,
      type: "existing" as const,
      url,
    })),
  );
  const [videos, setVideos] = useState<VideoItem[]>(
    initialData.videos.map((url) => ({
      key: `existing-video-${url}`,
      type: "existing" as const,
      url,
    })),
  );

  const groupedOptions = useMemo(
    () => {
      const groups = new Map<
        string,
        {
          iconSvg: string | null;
          id: string;
          name: string;
          options: EquipmentOption[];
          order: number;
        }
      >();

      for (const option of options) {
        const current = groups.get(option.category.id);

        if (current) {
          current.options.push(option);
        } else {
          groups.set(option.category.id, {
            iconSvg: option.category.iconSvg,
            id: option.category.id,
            name: option.category.name,
            options: [option],
            order: option.category.order,
          });
        }
      }

      return Array.from(groups.values()).sort(
        (first, second) =>
          first.order - second.order || first.name.localeCompare(second.name),
      );
    },
    [options],
  );

  const toast = state.message ? state : null;
  const errorSummary = getFieldErrorSummary(state);

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      const timeout = window.setTimeout(() => {
        router.push(state.redirectTo || "/admin/vehicles");
        router.refresh();
      }, 700);

      return () => window.clearTimeout(timeout);
    }
  }, [router, state]);

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.type === "new") {
          URL.revokeObjectURL(image.url);
        }
      });
      videos.forEach((video) => {
        if (video.type === "new") {
          URL.revokeObjectURL(video.url);
        }
      });
    };
  }, [images, videos]);

  function addFiles(files: FileList | null) {
    if (!files?.length) return;

    const availableSlots = Math.max(0, MAX_VEHICLE_IMAGES - images.length);
    const nextFiles = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, availableSlots);

    setImages((current) => [
      ...current,
      ...nextFiles.map((file) => ({
        key: `new-${crypto.randomUUID()}`,
        type: "new" as const,
        file,
        url: URL.createObjectURL(file),
      })),
    ]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function addMediaAsset(asset: VehicleMediaLibraryAsset) {
    setImages((current) => {
      if (current.length >= MAX_VEHICLE_IMAGES) return current;
      if (
        current.some(
          (image) => image.type === "existing" && image.url === asset.localPath,
        )
      ) {
        return current;
      }

      return [
        ...current,
        {
          key: `media-${asset.id}`,
          type: "existing" as const,
          url: asset.localPath,
        },
      ];
    });
  }

  function addVideoFiles(files: FileList | null) {
    if (!files?.length) return;

    const availableSlots = Math.max(0, MAX_VEHICLE_VIDEOS - videos.length);
    const nextFiles = Array.from(files)
      .filter((file) =>
        ["video/mp4", "video/webm", "video/quicktime"].includes(file.type),
      )
      .slice(0, availableSlots);

    setVideos((current) => [
      ...current,
      ...nextFiles.map((file) => ({
        key: `new-video-${crypto.randomUUID()}`,
        type: "new" as const,
        file,
        url: URL.createObjectURL(file),
      })),
    ]);

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  }

  function addYoutubeVideo() {
    const cleanUrl = youtubeUrl.trim();

    if (!cleanUrl || !isYouTubeUrl(cleanUrl)) {
      window.alert("Ajoutez un lien YouTube valide.");
      return;
    }

    setVideos((current) => {
      if (current.length >= MAX_VEHICLE_VIDEOS) return current;
      if (
        current.some(
          (video) => video.type === "existing" && video.url === cleanUrl,
        )
      ) {
        return current;
      }

      return [
        ...current,
        {
          key: `youtube-video-${crypto.randomUUID()}`,
          type: "existing" as const,
          url: cleanUrl,
        },
      ];
    });
    setYoutubeUrl("");
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  function removeImage(index: number) {
    const confirmed = window.confirm(
      "Retirer cette image de la galerie du vehicule ?",
    );

    if (!confirmed) return;

    setImages((current) => {
      const item = current[index];
      if (item?.type === "new") {
        URL.revokeObjectURL(item.url);
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function removeVideo(index: number) {
    const confirmed = window.confirm(
      "Retirer cette video de la fiche du vehicule ?",
    );

    if (!confirmed) return;

    setVideos((current) => {
      const item = current[index];
      if (item?.type === "new") {
        URL.revokeObjectURL(item.url);
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function submitForm(formData: FormData) {
    for (const image of images) {
      if (image.type === "existing") {
        formData.append("existingImages", image.url);
      } else {
        formData.append("images", image.file);
      }
    }
    for (const video of videos) {
      if (video.type === "existing") {
        formData.append("existingVideos", video.url);
      } else {
        formData.append("videos", video.file);
      }
    }
    startSubmitTransition(() => {
      formAction(formData);
    });
  }

  return (
    <>
      {toast ? (
        <div
          className={cn(
            "fixed right-5 top-5 z-50 flex max-w-sm items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-2xl",
            toast.ok
              ? "border-emerald-500/30 bg-emerald-950 text-emerald-100"
              : "border-[#a21d2f]/40 bg-[#a21d2f]/10 text-[#a21d2f]",
          )}
        >
          {toast.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <p>{toast.message}</p>
        </div>
      ) : null}

      <form
        action={submitForm}
        className="grid gap-6"
      >
        {!state.ok && errorSummary.length ? (
          <div className="rounded-md border border-[#a21d2f]/40 bg-[#a21d2f]/10 px-4 py-3 text-sm text-[#a21d2f]">
            <p className="font-semibold">{state.message}</p>
            <ul className="mt-3 grid gap-1.5">
              {errorSummary.map(({ error, field, label }) => (
                <li key={`${field}-${error}`}>
                  <span className="font-semibold text-zinc-100">{label}</span>
                  {" : "}
                  {error}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <SectionTitle
            description="Identite commerciale du vehicule et visibilite showroom."
            title="Informations generales"
          />

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Field label="Titre" error={getFieldError(state, "title")}>
              <input
                className={inputClass}
                defaultValue={initialData.title}
                name="title"
                onChange={(event) => {
                  if (!slugTouched) {
                    setSlug(slugify(event.target.value));
                  }
                }}
                required
              />
            </Field>
            <Field label="Slug" error={getFieldError(state, "slug")}>
              <input
                className={inputClass}
                name="slug"
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                required
                value={slug}
              />
            </Field>
            <Field label="Marque" error={getFieldError(state, "brandId")}>
              <select
                className={inputClass}
                defaultValue={initialData.brandId}
                name="brandId"
                required
              >
                <option value="">Selectionner</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Categorie" error={getFieldError(state, "categoryId")}>
              <select
                className={inputClass}
                defaultValue={initialData.categoryId}
                name="categoryId"
              >
                <option value="">Aucune categorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Modele" error={getFieldError(state, "model")}>
              <input
                className={inputClass}
                defaultValue={initialData.model}
                name="model"
                placeholder="G80, X5, Corolla..."
              />
            </Field>
            <Field label="Generation" error={getFieldError(state, "generation")}>
              <input
                className={inputClass}
                defaultValue={initialData.generation}
                name="generation"
                placeholder="G30, XV70, W206..."
              />
            </Field>
            <Field label="Finition" error={getFieldError(state, "trim")}>
              <input
                className={inputClass}
                defaultValue={initialData.trim}
                name="trim"
                placeholder="Luxury, Executive, GT Line..."
              />
            </Field>
            <Field label="Annee" error={getFieldError(state, "year")}>
              <input
                className={inputClass}
                defaultValue={initialData.year}
                min="1950"
                name="year"
                type="number"
              />
            </Field>
            <Field label="Prix" error={getFieldError(state, "price")}>
              <div className="grid grid-cols-[1fr_120px] gap-2">
                <input
                  className={inputClass}
                  defaultValue={initialData.price}
                  min="0"
                  name="price"
                  required
                  step="0.01"
                  type="number"
                />
                <select
                  className={inputClass}
                  defaultValue={initialData.priceCurrency}
                  name="priceCurrency"
                >
                  <option value="TND">TND</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </Field>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <Field label="Statut" error={getFieldError(state, "status")}>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {(["BROUILLON", "DISPONIBLE", "VENDU", "RESERVE"] as const).map((status) => (
                  <label
                    className="flex h-10 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200"
                    key={status}
                  >
                    <input
                      className="accent-primary"
                      defaultChecked={initialData.status === status}
                      name="status"
                      type="radio"
                      value={status}
                    />
                    {statusLabels[status]}
                  </label>
                ))}
              </div>
            </Field>
            <label className="flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200">
              <input
                className="h-4 w-4 accent-primary"
                defaultChecked={initialData.isFeatured}
                name="isFeatured"
                type="checkbox"
              />
              Mise en avant
            </label>
            <label className="flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200">
              <input
                className="h-4 w-4 accent-primary"
                defaultChecked={initialData.isNew}
                name="isNew"
                type="checkbox"
              />
              Nouveau
            </label>
          </div>
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <SectionTitle
            description={`Maximum ${MAX_VEHICLE_VIDEOS} videos: fichier MP4/WebM/MOV ou lien YouTube.`}
            title="Videos"
          />
          <div className="mt-5 rounded-md border border-dashed border-zinc-700 bg-zinc-950 p-5 text-center">
            <Film className="mx-auto h-8 w-8 text-zinc-500" />
            <p className="mt-2 text-sm font-medium text-zinc-200">
              Ajoutez plusieurs videos de presentation du vehicule
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              MP4, WebM, MOV ou lien YouTube. Taille maximale: 80 Mo par fichier.
            </p>
            <input
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              multiple
              onChange={(event) => addVideoFiles(event.target.files)}
              ref={videoInputRef}
              type="file"
            />
            <Button
              className="mt-4 border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800 hover:text-white"
              disabled={videos.length >= MAX_VEHICLE_VIDEOS}
              onClick={() => videoInputRef.current?.click()}
              type="button"
              variant="outline"
            >
              <Film className="h-4 w-4" />
              Charger une video
            </Button>
            <div className="mx-auto mt-4 grid max-w-2xl gap-2 sm:grid-cols-[1fr_auto]">
              <input
                className={inputClass}
                disabled={videos.length >= MAX_VEHICLE_VIDEOS}
                onChange={(event) => setYoutubeUrl(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                type="url"
                value={youtubeUrl}
              />
              <Button
                disabled={videos.length >= MAX_VEHICLE_VIDEOS}
                onClick={addYoutubeVideo}
                type="button"
                variant="outline"
              >
                <Link2 className="h-4 w-4" />
                Ajouter YouTube
              </Button>
            </div>
          </div>
          {getFieldError(state, "videos") ? (
            <p className="mt-2 text-sm text-[#a21d2f]">
              {getFieldError(state, "videos")}
            </p>
          ) : null}
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {videos.map((video, index) => (
              <div
                className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-950"
                key={video.key}
              >
                {isYouTubeUrl(video.url) ? (
                  <iframe
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="aspect-video w-full bg-black"
                    src={getYouTubeEmbedUrl(video.url)}
                    title={`Video YouTube ${index + 1}`}
                  />
                ) : (
                  <video
                    className="aspect-video w-full bg-black object-contain"
                    controls
                    preload="metadata"
                    src={video.url}
                  />
                )}
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="text-xs font-medium text-zinc-400">
                    Video {index + 1} / {MAX_VEHICLE_VIDEOS}
                  </span>
                  <Button
                    onClick={() => removeVideo(index)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <SectionTitle
            description="Specifications utiles pour la comparaison et la recherche."
            title="Caracteristiques techniques"
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Puissance (CV)" error={getFieldError(state, "power")}>
              <input
                className={inputClass}
                defaultValue={initialData.power}
                min="1"
                name="power"
                type="number"
              />
            </Field>
            <Field label="Cylindree" error={getFieldError(state, "displacement")}>
              <input
                className={inputClass}
                defaultValue={initialData.displacement}
                name="displacement"
                placeholder="2000cc"
              />
            </Field>
            <Field label="Type moteur" error={getFieldError(state, "engine")}>
              <input
                className={inputClass}
                defaultValue={initialData.engine}
                name="engine"
                placeholder="2.0 TDI"
              />
            </Field>
            <Field label="Code moteur" error={getFieldError(state, "engineCode")}>
              <input
                className={inputClass}
                defaultValue={initialData.engineCode}
                name="engineCode"
                placeholder="B47D20, M274..."
              />
            </Field>
            <Field label="Motorisation" error={getFieldError(state, "motorization")}>
              <input
                className={inputClass}
                defaultValue={initialData.motorization}
                name="motorization"
                placeholder="2.0 diesel, 1.6 hybride..."
              />
            </Field>
            <Field label="Carburant" error={getFieldError(state, "fuelType")}>
              <select
                className={inputClass}
                defaultValue={initialData.fuelType}
                name="fuelType"
              >
                <option value="ESSENCE">Essence</option>
                <option value="DIESEL">Diesel</option>
                <option value="HYBRIDE">Hybride</option>
                <option value="ELECTRIQUE">Electrique</option>
              </select>
            </Field>
            <Field
              label="Transmission"
              error={getFieldError(state, "transmission")}
            >
              <input
                className={inputClass}
                defaultValue={initialData.transmission}
                name="transmission"
                placeholder="Automatique, manuelle, CVT..."
              />
            </Field>
            <Field
              label="Boite de vitesses"
              error={getFieldError(state, "gearbox")}
            >
              <input
                className={inputClass}
                defaultValue={initialData.gearbox}
                name="gearbox"
                placeholder="BVA 8 rapports, CVT..."
              />
            </Field>
            <Field
              label="Date de mise en circulation"
              error={getFieldError(state, "firstRegistrationDate")}
            >
              <input
                className={inputClass}
                defaultValue={initialData.firstRegistrationDate}
                name="firstRegistrationDate"
                type="date"
              />
            </Field>
            <Field label="Kilometrage" error={getFieldError(state, "mileage")}>
              <input
                className={inputClass}
                defaultValue={initialData.mileage}
                min="0"
                name="mileage"
                type="number"
              />
            </Field>
            <Field label="Nombre de portes" error={getFieldError(state, "doors")}>
              <input
                className={inputClass}
                defaultValue={initialData.doors}
                min="1"
                name="doors"
                type="number"
              />
            </Field>
            <Field label="Nombre de places" error={getFieldError(state, "seats")}>
              <input
                className={inputClass}
                defaultValue={initialData.seats}
                min="1"
                name="seats"
                type="number"
              />
            </Field>
            <Field label="Couleur" error={getFieldError(state, "colorName")}>
              <div className="grid grid-cols-[56px_1fr] gap-2">
                <input
                  aria-label="Code couleur"
                  className="h-10 w-14 rounded-md border border-zinc-800 bg-zinc-950 p-1"
                  defaultValue={initialData.colorHex}
                  name="colorHex"
                  type="color"
                />
                <input
                  className={inputClass}
                  defaultValue={initialData.colorName}
                  name="colorName"
                  placeholder="Noir obsidienne"
                />
              </div>
            </Field>
            <Field
              label="Immatriculation"
              error={getFieldError(state, "registration")}
            >
              <input
                className={inputClass}
                defaultValue={initialData.registration}
                name="registration"
                placeholder="12345-A-6"
              />
            </Field>
            <Field label="VIN (Numero de chassis)" error={getFieldError(state, "vin")}>
              <input
                className={inputClass}
                defaultValue={initialData.vin}
                name="vin"
                placeholder="WBA..."
              />
            </Field>
          </div>
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <SectionTitle
            description="Equipements visibles dans la fiche vehicule."
            title="Options & equipements"
          />
          <div className="mt-5 grid gap-4 xl:grid-cols-4">
            {groupedOptions.map((group) => (
              <div
                className="rounded-md border border-zinc-800 bg-zinc-950 p-4"
                key={group.id}
              >
                <div className="flex items-center gap-2">
                  {group.iconSvg ? (
                    <span
                      className="grid h-5 w-5 place-items-center text-[#a21d2f] [&_svg]:h-5 [&_svg]:w-5"
                      dangerouslySetInnerHTML={{ __html: group.iconSvg }}
                    />
                  ) : null}
                  <h4 className="text-sm font-semibold text-zinc-100">
                    {group.name}
                  </h4>
                </div>
                <div className="mt-3 grid gap-2">
                  {group.options.length ? (
                    group.options.map((option) => (
                      <label
                        className="flex items-center gap-2 text-sm text-zinc-300"
                        key={option.id}
                      >
                        <input
                          className="h-4 w-4 accent-primary"
                          defaultChecked={initialData.optionIds.includes(option.id)}
                          name="optionIds"
                          type="checkbox"
                          value={option.id}
                        />
                        {option.name}
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500">Aucune option.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <SectionTitle
            description={`Maximum ${MAX_VEHICLE_IMAGES} images. La premiere image devient la photo principale.`}
            title="Images"
          />
          <div
            className="mt-5 rounded-md border border-dashed border-zinc-700 bg-zinc-950 p-5 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              addFiles(event.dataTransfer.files);
            }}
          >
            <ImagePlus className="mx-auto h-8 w-8 text-zinc-500" />
            <p className="mt-2 text-sm font-medium text-zinc-200">
              Glissez les images ici, selectionnez depuis le PC ou utilisez le media
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              JPG, PNG, JPEG convertis en WebP. Stockage pret pour CDN.
            </p>
            <input
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              multiple
              onChange={(event) => addFiles(event.target.files)}
              ref={fileInputRef}
              type="file"
            />
            <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
              <Button
                className="border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800 hover:text-white"
                onClick={() => fileInputRef.current?.click()}
                type="button"
                variant="outline"
              >
                <ImagePlus className="h-4 w-4" />
                Charger depuis le PC
              </Button>
              <Button
                className={cn(
                  !showMediaLibrary &&
                    "border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800 hover:text-white",
                )}
                disabled={!mediaAssets.length}
                onClick={() => setShowMediaLibrary((value) => !value)}
                type="button"
                variant={showMediaLibrary ? "default" : "outline"}
              >
                <Images className="h-4 w-4" />
                Choisir depuis le media
              </Button>
            </div>
          </div>
          {getFieldError(state, "images") ? (
            <p className="mt-2 text-sm text-[#a21d2f]">
              {getFieldError(state, "images")}
            </p>
          ) : null}

          {showMediaLibrary ? (
            <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">
                    Bibliotheque media
                  </h4>
                  <p className="mt-1 text-xs text-zinc-500">
                    Selectionnez une image deja optimisee. Les doublons sont ignores.
                  </p>
                </div>
                <span className="text-xs text-zinc-500">
                  {images.length}/{MAX_VEHICLE_IMAGES} images selectionnees
                </span>
              </div>
              <div className="mt-4 grid max-h-96 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {mediaAssets.map((asset) => {
                  const isSelected = images.some(
                    (image) =>
                      image.type === "existing" && image.url === asset.localPath,
                  );

                  return (
                    <button
                      className={cn(
                        "overflow-hidden rounded-md border bg-zinc-900 text-left transition hover:border-[#a21d2f]",
                        isSelected
                          ? "border-emerald-500 ring-2 ring-emerald-500/30"
                          : "border-zinc-800",
                      )}
                      disabled={isSelected || images.length >= MAX_VEHICLE_IMAGES}
                      key={asset.id}
                      onClick={() => addMediaAsset(asset)}
                      type="button"
                    >
                      <span className="relative block aspect-[4/3] bg-zinc-950">
                        <Image
                          alt={asset.alt || asset.title || asset.originalName}
                          className="object-cover"
                          fill
                          sizes="(max-width: 1280px) 50vw, 25vw"
                          src={asset.localPath}
                          unoptimized
                        />
                        {isSelected ? (
                          <span className="absolute left-2 top-2 rounded bg-emerald-500 px-2 py-1 text-xs font-semibold text-white">
                            Selectionnee
                          </span>
                        ) : null}
                      </span>
                      <span className="block truncate px-3 py-2 text-xs font-medium text-zinc-300">
                        {asset.title || asset.originalName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {images.map((image, index) => (
              <div
                className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-950"
                key={image.key}
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    src={image.url}
                    unoptimized
                  />
                  {index === 0 ? (
                    <span className="absolute left-2 top-2 rounded bg-primary px-2 py-1 text-xs font-semibold text-white">
                      Principale
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-1 p-2">
                  <Button
                    disabled={index === 0}
                    onClick={() => moveImage(index, -1)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled={index === images.length - 1}
                    onClick={() => moveImage(index, 1)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => removeImage(index)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <SectionTitle
            description="Description commerciale enrichie pour la fiche publique."
            title="Description"
          />
          <div className="mt-5">
            <div className="rounded-t-md border border-b-0 border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-500">
              Rich textarea compatible HTML simple
            </div>
            <textarea
              className="min-h-48 w-full rounded-b-md border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4"
              defaultValue={initialData.description}
              name="description"
              placeholder="<p>Historique, entretien, garantie, points forts...</p>"
            />
            {getFieldError(state, "description") ? (
              <p className="mt-2 text-sm text-[#a21d2f]">
                {getFieldError(state, "description")}
              </p>
            ) : null}
          </div>
        </section>

        <div className="sticky bottom-0 z-20 -mx-4 flex flex-col justify-end gap-3 border-t border-zinc-800 bg-[#141414]/95 px-4 py-4 backdrop-blur sm:flex-row lg:-mx-8 lg:px-8">
          <Button
            asChild
            className="border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800 hover:text-white"
            type="button"
            variant="outline"
          >
            <Link href="/admin/vehicles">Annuler</Link>
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {mode === "create" ? "Ajouter le vehicule" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </>
  );
}

const inputClass =
  "h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4";

function SectionTitle({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-zinc-50">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-200">
      {label}
      {children}
      {error ? <span className="text-xs text-[#a21d2f]">{error}</span> : null}
    </label>
  );
}
