"use client";

import { useActionState, useMemo, useState } from "react";
import {
  BadgeCheck,
  Car,
  Eye,
  EyeOff,
  HelpCircle,
  Images,
  Loader2,
  Plus,
  Save,
  Star,
  Trash2,
} from "lucide-react";

import {
  type HomepageMediaOption,
  type HomepageActionState,
  getHomepageMediaOptions,
  updateHomepageSettings,
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
import type { HomepageSettingsView } from "@/lib/homepage-settings";
import { getMediaUrl } from "@/lib/cdn";

type VehicleOption = {
  brandName: string;
  categoryName: string;
  id: string;
  images: string[];
  isFeatured: boolean;
  title: string;
  year: number | null;
};

type CategoryOption = {
  id: string;
  isActive: boolean;
  name: string;
  order: number;
};

type MediaOption = HomepageMediaOption;

const initialState: HomepageActionState = {
  message: "",
  ok: false,
};

export function HomepageForm({
  categories,
  hasMoreMedia,
  mediaOptions,
  settings,
  vehicles,
}: {
  categories: CategoryOption[];
  hasMoreMedia: boolean;
  mediaOptions: MediaOption[];
  settings: HomepageSettingsView;
  vehicles: VehicleOption[];
}) {
  const [state, formAction, isPending] = useActionState(
    updateHomepageSettings,
    initialState,
  );
  const vehicleById = useMemo(
    () => new Map(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );
  const [faqRows, setFaqRows] = useState(() =>
    (settings.faqItems.length
      ? settings.faqItems
      : [{ answer: "", question: "" }]
    ).map((item, index) => ({
      ...item,
      rowId: `faq-${index}-${item.question}`,
    })),
  );

  return (
    <form action={formAction} className="grid gap-8">
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

      <Panel
        description="Selectionnez 1 a 5 vehicules. Chaque slide peut utiliser une image differente de la galerie Media ou un upload."
        icon={<Car className="h-4 w-4 text-[#a21d2f]" />}
        title="Hero"
      >
        {state.fieldErrors?.heroSlides ? (
          <p className="text-sm text-red-300">{state.fieldErrors.heroSlides[0]}</p>
        ) : null}
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, index) => {
            const slide = settings.heroSlides[index];
            const selectedVehicle = slide ? vehicleById.get(slide.vehicleId) : null;
            const fallbackImage = selectedVehicle?.images[0]
              ? getMediaUrl(selectedVehicle.images[0])
              : null;

            return (
              <HeroSlideEditor
                currentImagePath={slide?.imagePath || ""}
                currentPreviewUrl={
                  slide?.imagePath ? getMediaUrl(slide.imagePath) : fallbackImage
                }
                index={index}
                key={index}
                hasMoreMedia={hasMoreMedia}
                mediaOptions={mediaOptions}
                selectedVehicleId={slide?.vehicleId || ""}
                vehicles={vehicles}
              />
            );
          })}
        </div>
      </Panel>

      <Panel
        description="Ce titre est rendu en h1 sous le hero, avec le paragraphe dessous."
        icon={<BadgeCheck className="h-4 w-4 text-[#a21d2f]" />}
        title="A propos"
      >
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <FieldError errors={state.fieldErrors?.aboutTitle}>
            <label className={labelClass}>
              Titre H1
              <input
                className={inputClass}
                defaultValue={settings.aboutTitle}
                maxLength={180}
                name="aboutTitle"
                required
              />
            </label>
          </FieldError>
          <FieldError errors={state.fieldErrors?.aboutText}>
            <label className={labelClass}>
              Paragraphe
              <textarea
                className={textareaClass}
                defaultValue={settings.aboutText}
                name="aboutText"
                required
              />
            </label>
          </FieldError>
        </div>
      </Panel>

      <Panel
        description="Cochez les types a afficher et indiquez leur ordre sur la home."
        icon={<Images className="h-4 w-4 text-[#a21d2f]" />}
        title="Types de vehicules"
      >
        <OrderedCheckboxList
          checkedIds={settings.categoryOrder}
          emptyText="Aucune categorie disponible."
          fieldName="categoryId"
          items={categories.map((category) => ({
            id: category.id,
            meta: category.isActive ? "Active" : "Inactive",
            name: category.name,
            order: category.order,
          }))}
          orderPrefix="categoryOrder-"
        />
      </Panel>

      <Panel
        description="Cochez les vehicules a la une a afficher dans la grille principale."
        icon={<Star className="h-4 w-4 text-[#a21d2f]" />}
        title="Vehicules a la une"
      >
        <OrderedCheckboxList
          checkedIds={settings.featuredVehicleIds}
          emptyText="Aucun vehicule disponible."
          fieldName="featuredVehicleId"
          items={vehicles.map((vehicle, index) => ({
            id: vehicle.id,
            meta: `${vehicle.brandName} / ${vehicle.categoryName}`,
            name: vehicle.title,
            order: index + 1,
          }))}
          orderPrefix="featuredVehicleOrder-"
        />
      </Panel>

      <Panel
        description="Cette voiture s'affiche dans le bloc large entre la grille principale et Pourquoi nous choisir."
        icon={<Car className="h-4 w-4 text-[#a21d2f]" />}
        title="Voiture mise en avant"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <label className={labelClass}>
            Vehicule
            <select
              className={inputClass}
              defaultValue={settings.spotlightVehicleId || ""}
              name="spotlightVehicleId"
            >
              <option value="">Utiliser le premier hero</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.title}
                </option>
              ))}
            </select>
          </label>
          <FieldError errors={state.fieldErrors?.spotlightTitle}>
            <label className={labelClass}>
              Titre
              <input
                className={inputClass}
                defaultValue={settings.spotlightTitle}
                maxLength={180}
                name="spotlightTitle"
                required
              />
            </label>
          </FieldError>
          <FieldError errors={state.fieldErrors?.spotlightDescription}>
            <label className={labelClass}>
              Description
              <textarea
                className={textareaClass}
                defaultValue={settings.spotlightDescription}
                name="spotlightDescription"
                required
              />
            </label>
          </FieldError>
        </div>
      </Panel>

      <Panel
        description="Modifie les cartes Pourquoi nous choisir de la partie front."
        icon={<BadgeCheck className="h-4 w-4 text-[#a21d2f]" />}
        title="Pourquoi nous choisir"
      >
        <FieldError errors={state.fieldErrors?.whyChooseUsTitle}>
          <label className={`${labelClass} max-w-xl`}>
            Titre de section
            <input
              className={inputClass}
              defaultValue={settings.whyChooseUsTitle}
              maxLength={180}
              name="whyChooseUsTitle"
              required
            />
          </label>
        </FieldError>
        {state.fieldErrors?.whyChooseUsItems ? (
          <p className="text-sm text-red-300">
            {state.fieldErrors.whyChooseUsItems[0]}
          </p>
        ) : null}
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => {
            const item = settings.whyChooseUsItems[index] || {
              text: "",
              title: "",
            };

            return (
              <div
                className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-950 p-4"
                key={index}
              >
                <label className={labelClass}>
                  Titre {index + 1}
                  <input
                    className={inputClass}
                    defaultValue={item.title}
                    maxLength={120}
                    name={`whyTitle${index}`}
                  />
                </label>
                <label className={labelClass}>
                  Description {index + 1}
                  <textarea
                    className={textareaClass}
                    defaultValue={item.text}
                    name={`whyText${index}`}
                  />
                </label>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel
        description="Active ou desactive l'affichage du bloc avis clients sur la page d'accueil."
        icon={
          settings.showReviews ? (
            <Eye className="h-4 w-4 text-[#a21d2f]" />
          ) : (
            <EyeOff className="h-4 w-4 text-[#a21d2f]" />
          )
        }
        title="Avis"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex h-11 items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200">
            <input
              className="accent-primary"
              defaultChecked={settings.showReviews}
              name="showReviews"
              type="radio"
              value="true"
            />
            <Eye className="h-4 w-4" />
            Afficher les avis
          </label>
          <label className="flex h-11 items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200">
            <input
              className="accent-primary"
              defaultChecked={!settings.showReviews}
              name="showReviews"
              type="radio"
              value="false"
            />
            <EyeOff className="h-4 w-4" />
            Cacher les avis
          </label>
        </div>
      </Panel>

      <Panel
        description="Ajoutez les questions frequentes et choisissez si le bloc FAQ s'affiche sur la home."
        icon={
          settings.showFaqs ? (
            <HelpCircle className="h-4 w-4 text-[#a21d2f]" />
          ) : (
            <EyeOff className="h-4 w-4 text-[#a21d2f]" />
          )
        }
        title="FAQ"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex h-11 items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200">
            <input
              className="accent-primary"
              defaultChecked={settings.showFaqs}
              name="showFaqs"
              type="radio"
              value="true"
            />
            <Eye className="h-4 w-4" />
            Afficher les FAQ
          </label>
          <label className="flex h-11 items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200">
            <input
              className="accent-primary"
              defaultChecked={!settings.showFaqs}
              name="showFaqs"
              type="radio"
              value="false"
            />
            <EyeOff className="h-4 w-4" />
            Cacher les FAQ
          </label>
        </div>

        {state.fieldErrors?.faqItems ? (
          <p className="text-sm text-red-300">{state.fieldErrors.faqItems[0]}</p>
        ) : null}

        <div className="grid gap-4">
          {faqRows.map((item, index) => (
            <div
              className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-950 p-4"
              key={item.rowId}
            >
              <input name="faqIndex" type="hidden" value={index} />
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-zinc-100">
                  Question {index + 1}
                </p>
                <Button
                  disabled={faqRows.length === 1}
                  onClick={() =>
                    setFaqRows((rows) =>
                      rows.length === 1
                        ? rows
                        : rows.filter((row) => row.rowId !== item.rowId),
                    )
                  }
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Supprimer cette FAQ</span>
                </Button>
              </div>
              <label className={labelClass}>
                Question
                <input
                  className={inputClass}
                  defaultValue={item.question}
                  maxLength={180}
                  name={`faqQuestion${index}`}
                />
              </label>
              <label className={labelClass}>
                Reponse
                <textarea
                  className={textareaClass}
                  defaultValue={item.answer}
                  name={`faqAnswer${index}`}
                />
              </label>
            </div>
          ))}
        </div>

        <div>
          <Button
            disabled={faqRows.length >= 12}
            onClick={() =>
              setFaqRows((rows) => [
                ...rows,
                {
                  answer: "",
                  question: "",
                  rowId: `faq-new-${Date.now()}-${rows.length}`,
                },
              ])
            }
            type="button"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Ajouter une FAQ
          </Button>
        </div>
      </Panel>

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

function HeroSlideEditor({
  currentImagePath,
  currentPreviewUrl,
  hasMoreMedia,
  index,
  mediaOptions,
  selectedVehicleId,
  vehicles,
}: {
  currentImagePath: string;
  currentPreviewUrl: string | null;
  hasMoreMedia: boolean;
  index: number;
  mediaOptions: MediaOption[];
  selectedVehicleId: string;
  vehicles: VehicleOption[];
}) {
  const [selectedPath, setSelectedPath] = useState(currentImagePath);
  const [previewUrl, setPreviewUrl] = useState(currentPreviewUrl);

  return (
    <div className="grid gap-4 rounded-md border border-zinc-800 bg-zinc-950 p-4 lg:grid-cols-[120px_1fr]">
      <input
        name={`heroCurrentImagePath${index}`}
        type="hidden"
        value={currentImagePath}
      />
      <input
        name={`heroImageMediaPath${index}`}
        type="hidden"
        value={selectedPath}
      />
      <div className="grid h-28 place-items-center overflow-hidden rounded-md bg-black">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="h-full w-full object-cover" src={previewUrl} />
        ) : (
          <Images className="h-6 w-6 text-zinc-600" />
        )}
      </div>
      <div className="grid gap-3">
        <label className={labelClass}>
          Vehicule hero {index + 1}
          <select
            className={inputClass}
            defaultValue={selectedVehicleId}
            name={`heroVehicleId${index}`}
            required={index === 0}
          >
            <option value="">Aucun vehicule</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.title} - {vehicle.brandName}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 md:grid-cols-[auto_1fr] md:items-end">
          <MediaPicker
            hasMoreMedia={hasMoreMedia}
            mediaOptions={mediaOptions}
            onSelect={(asset) => {
              setSelectedPath(asset?.localPath || "");
              setPreviewUrl(asset?.previewUrl || currentPreviewUrl);
            }}
            title={`Image hero ${index + 1}`}
          />
          <label className="grid gap-2 text-xs font-medium text-zinc-300">
            Ou telecharger une image
            <input
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className={fileInputClass}
              name={`heroImage${index}`}
              type="file"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function MediaPicker({
  hasMoreMedia,
  mediaOptions,
  onSelect,
  title,
}: {
  hasMoreMedia: boolean;
  mediaOptions: MediaOption[];
  onSelect: (asset: MediaOption | null) => void;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState(mediaOptions);
  const [hasMore, setHasMore] = useState(hasMoreMedia);
  const [nextPage, setNextPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  async function loadNextPage(page = nextPage) {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setLoadError("");

    try {
      const result = await getHomepageMediaOptions(page);
      setItems((currentItems) => {
        const existingIds = new Set(currentItems.map((item) => item.id));
        const newItems = result.items.filter((item) => !existingIds.has(item.id));

        return [...currentItems, ...newItems];
      });
      setHasMore(result.hasMore);
      setNextPage(result.nextPage);
    } catch {
      setLoadError("Impossible de charger plus de medias pour le moment.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);

    if (open && hasMore && items.length === mediaOptions.length) {
      void loadNextPage(1);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto" type="button" variant="outline">
          <Images className="h-4 w-4" />
          Choisir depuis Media
        </Button>
      </DialogTrigger>
      <DialogContent className="grid max-h-[90vh] grid-rows-[auto_minmax(0,1fr)_auto]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Selectionnez une image deja presente dans la bibliotheque Media.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto pr-1">
          {items.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <button
                className="flex min-h-28 cursor-pointer items-center gap-3 rounded-md border border-zinc-800 bg-black px-3 py-2 text-left text-xs text-zinc-300 transition hover:border-[#a21d2f]/60"
                onClick={() => {
                  onSelect(null);
                  setIsOpen(false);
                }}
                type="button"
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-zinc-900 text-zinc-500">
                  <Images className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold text-zinc-200">
                    Image du vehicule
                  </span>
                  <span className="mt-1 block text-zinc-500">
                    Utiliser l&apos;image principale du vehicule.
                  </span>
                </span>
              </button>
              {items.map((asset) => (
                <button
                  className="grid cursor-pointer grid-cols-[72px_1fr] items-center gap-3 rounded-md border border-zinc-800 bg-black p-3 text-left text-xs text-zinc-300 transition hover:border-[#a21d2f]/60"
                  key={asset.id}
                  onClick={() => {
                    onSelect(asset);
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-md bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={asset.previewUrl}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-zinc-200">
                      {asset.name}
                    </span>
                    <span className="mt-1 block text-zinc-500">
                      {asset.width && asset.height
                        ? `${asset.width} x ${asset.height}px`
                        : "Image"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-zinc-800 bg-black p-8 text-center text-sm text-zinc-500">
              Aucun media disponible.
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-zinc-500">
            {loadError ? (
              <span className="text-red-300">{loadError}</span>
            ) : (
              <span>{items.length} media{items.length > 1 ? "s" : ""} affiches</span>
            )}
          </div>
          <div className="flex justify-end gap-2">
            {hasMore ? (
              <Button
                disabled={isLoading}
                onClick={() => void loadNextPage()}
                type="button"
                variant="outline"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Charger plus
              </Button>
            ) : null}
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Fermer
            </Button>
          </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OrderedCheckboxList({
  checkedIds,
  emptyText,
  fieldName,
  items,
  orderPrefix,
}: {
  checkedIds: string[];
  emptyText: string;
  fieldName: string;
  items: Array<{ id: string; meta: string; name: string; order: number }>;
  orderPrefix: string;
}) {
  const orderById = new Map(checkedIds.map((id, index) => [id, index + 1]));
  const sortedItems = [...items].sort((a, b) => {
    const orderA = orderById.get(a.id) || 999 + a.order;
    const orderB = orderById.get(b.id) || 999 + b.order;

    return orderA - orderB;
  });

  if (!items.length) {
    return (
      <div className="rounded-md border border-zinc-800 bg-zinc-950 p-8 text-center text-sm text-zinc-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {sortedItems.map((item, index) => (
        <div
          className="flex flex-col gap-3 rounded-md border border-zinc-800 bg-zinc-950 p-3 sm:flex-row sm:items-center sm:justify-between"
          key={item.id}
        >
          <label className="flex min-w-0 flex-1 items-center gap-3 text-sm text-zinc-200">
            <input
              className="h-4 w-4 shrink-0 accent-primary"
              defaultChecked={checkedIds.includes(item.id)}
              name={fieldName}
              type="checkbox"
              value={item.id}
            />
            <span className="min-w-0">
              <span className="block truncate font-semibold">{item.name}</span>
              <span className="mt-0.5 block truncate text-xs text-zinc-500">
                {item.meta}
              </span>
            </span>
          </label>
          <label className="flex shrink-0 items-center justify-between gap-3 rounded-md border border-zinc-800 bg-black/25 px-3 py-2 text-xs font-medium text-zinc-400 sm:w-32">
            <span>Ordre</span>
            <input
              className="h-9 w-16 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-center text-sm font-semibold text-zinc-100 outline-none ring-primary/30 transition focus:ring-4"
              defaultValue={orderById.get(item.id) || index + 1}
              min="1"
              name={`${orderPrefix}${item.id}`}
              type="number"
            />
          </label>
        </div>
      ))}
    </div>
  );
}

function Panel({
  children,
  description,
  icon,
  title,
}: {
  children: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <section className="grid gap-4 rounded-md border border-zinc-800 bg-zinc-900 p-5">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
          {icon}
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function FieldError({
  children,
  errors,
}: {
  children: React.ReactNode;
  errors?: string[];
}) {
  return (
    <div className="grid gap-2">
      {children}
      {errors ? <span className="text-xs text-red-300">{errors[0]}</span> : null}
    </div>
  );
}

const inputClass =
  "h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4";

const textareaClass =
  "min-h-28 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4";

const fileInputClass =
  "rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none file:mr-4 file:rounded-md file:border-0 file:bg-[#a21d2f] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white focus:ring-4 focus:ring-primary/30";

const labelClass = "grid gap-2 text-sm font-medium text-zinc-200";

