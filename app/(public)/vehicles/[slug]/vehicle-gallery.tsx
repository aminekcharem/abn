"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

type GalleryImage = {
  alt: string;
  src: string;
};

type GalleryVideo = {
  src: string;
  title: string;
};

type GalleryBadge = {
  label: string;
  tone: "dark" | "light" | "yellow";
};

type VehicleGalleryProps = {
  badges: GalleryBadge[];
  images: GalleryImage[];
  title: string;
  videos?: GalleryVideo[];
};

const badgeStyles = {
  dark: "bg-[#1b1b1b] text-white",
  light: "bg-white text-[#1b1b1b]",
  yellow: "bg-[#ffc10a] text-[#1b1b1b]",
};

export function VehicleGallery({
  badges,
  images,
  title,
  videos = [],
}: VehicleGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const safeImages = useMemo(
    () => (images.length ? images : [{ alt: title, src: "/showroom-hero.png" }]),
    [images, title],
  );
  const visibleThumbnailCount = Math.min(safeImages.length, 6);
  const thumbnailImages = safeImages.slice(0, visibleThumbnailCount);
  const overlayIndex = visibleThumbnailCount === 6 ? 5 : -1;
  const hiddenImageCount =
    safeImages.length > visibleThumbnailCount ? safeImages.length - 5 : 0;
  const activeImage = safeImages[activeIndex] ?? safeImages[0];

  const showImage = useCallback((index: number) => {
    const nextIndex = (index + safeImages.length) % safeImages.length;
    setActiveIndex(nextIndex);
  }, [safeImages.length]);

  function openLightbox(index = activeIndex) {
    showImage(index);
    setIsLightboxOpen(true);
  }

  useEffect(() => {
    if (!isLightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }

      if (event.key === "ArrowLeft") {
        showImage(activeIndex - 1);
      }

      if (event.key === "ArrowRight") {
        showImage(activeIndex + 1);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, isLightboxOpen, safeImages.length, showImage]);

  return (
    <div>
      <div className="relative">
        <button
          aria-label={`Agrandir ${activeImage.alt}`}
          className="group relative block h-[360px] w-full overflow-hidden rounded-md bg-white text-left sm:h-[520px]"
          data-testid="vehicle-gallery-main"
          onClick={() => openLightbox(activeIndex)}
          type="button"
        >
          <Image
            alt={activeImage.alt}
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 820px"
            src={activeImage.src}
            unoptimized
          />
        </button>

        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              className={`rounded-full px-4 py-2 text-xs font-semibold ${badgeStyles[badge.tone]}`}
              key={badge.label}
            >
              {badge.label}
            </span>
          ))}
        </div>
        <button
          className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1b1b1b] shadow-sm transition hover:bg-[#ffc10a]"
          onClick={() => openLightbox(activeIndex)}
          type="button"
        >
          <Maximize2 className="h-4 w-4" />
          Agrandir
        </button>
      </div>

      {safeImages.length > 1 ? (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {thumbnailImages.map((image, index) => {
            const isOverlayTile = index === overlayIndex && hiddenImageCount > 0;

            return (
              <button
                aria-label={
                  isOverlayTile
                    ? `Voir toutes les images de ${title}`
                    : `Afficher ${image.alt}`
                }
                className={`group relative aspect-[4/3] overflow-hidden rounded-md bg-white ring-offset-2 transition ${
                  activeIndex === index && !isOverlayTile
                    ? "ring-2 ring-[#ffc10a]"
                    : "opacity-80 hover:opacity-100"
                }`}
                data-testid="vehicle-gallery-thumbnail"
                key={`${image.src}-${index}`}
                onClick={() => {
                  if (isOverlayTile) {
                    openLightbox(index);
                    return;
                  }

                  showImage(index);
                }}
                type="button"
              >
                <Image
                  alt={image.alt}
                  className="object-cover transition duration-300 group-hover:scale-105"
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 33vw, 132px"
                  src={image.src}
                  unoptimized
                />

                {isOverlayTile ? (
                  <span className="absolute inset-0 grid place-items-center bg-black/55 text-2xl font-semibold text-white">
                    +{hiddenImageCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {videos.length ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {videos.map((video, index) => (
            <div
              className="overflow-hidden rounded-md border border-[#1b1b1b]/10 bg-white shadow-sm"
              key={`${video.src}-${index}`}
            >
              <video
                className="aspect-video w-full bg-[#1b1b1b] object-contain"
                controls
                preload="metadata"
                src={video.src}
              />
              <div className="px-4 py-3 text-sm font-semibold text-[#1b1b1b]">
                {video.title}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {isLightboxOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#1b1b1b]/95 p-4 text-white"
          data-testid="vehicle-gallery-lightbox"
          role="dialog"
        >
          <button
            aria-label="Fermer la galerie"
            className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-[#1b1b1b] transition hover:bg-[#ffc10a]"
            data-testid="vehicle-gallery-close"
            onClick={() => setIsLightboxOpen(false)}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>

          {safeImages.length > 1 ? (
            <>
              <button
                aria-label="Image précédente"
                className="absolute left-4 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-[#1b1b1b] transition hover:bg-[#ffc10a]"
                data-testid="vehicle-gallery-prev"
                onClick={() => showImage(activeIndex - 1)}
                type="button"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                aria-label="Image suivante"
                className="absolute right-4 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-[#1b1b1b] transition hover:bg-[#ffc10a]"
                data-testid="vehicle-gallery-next"
                onClick={() => showImage(activeIndex + 1)}
                type="button"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}

          <button
            aria-label="Fermer l'agrandissement"
            className="absolute inset-0 h-full w-full cursor-zoom-out"
            onClick={() => setIsLightboxOpen(false)}
            type="button"
          />
          <div className="relative mx-auto flex h-full max-w-6xl items-center justify-center px-10 py-12">
            <div className="relative h-full max-h-[82vh] w-full">
              <Image
                alt={activeImage.alt}
                className="object-contain"
                fill
                priority
                sizes="100vw"
                src={activeImage.src}
                unoptimized
              />
            </div>
          </div>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
            {activeIndex + 1} / {safeImages.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}
