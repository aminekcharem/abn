"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath, revalidateTag } from "next/cache";
import type { FuelType } from "@prisma/client";

import { auth } from "@/auth";
import { getMediaUrl } from "@/lib/cdn";
import { saveMediaFile } from "@/lib/media";
import { getPrisma } from "@/lib/prisma";
import {
  type VehicleActionState,
  vehicleSchema,
} from "@/lib/validations/vehicle";

const MAX_VEHICLE_IMAGES = 100;
const MAX_VEHICLE_VIDEOS = 8;
const allowedVideoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const allowedReportTypes = new Set(["application/pdf"]);

async function ensureAdmin() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

function getIds(formData: FormData) {
  const ids = formData
    .getAll("id")
    .map((id) => String(id))
    .filter(Boolean);

  if (!ids.length) {
    throw new Error("Aucun vehicule selectionne.");
  }

  return ids;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function getVehiclePayload(formData: FormData) {
  return vehicleSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || slugify(String(formData.get("title") ?? "")),
    brandId: formData.get("brandId"),
    categoryId: formData.get("categoryId"),
    model: formData.get("model"),
    generation: formData.get("generation"),
    trim: formData.get("trim"),
    engineCode: formData.get("engineCode"),
    motorization: formData.get("motorization"),
    price: formData.get("price"),
    priceCurrency: formData.get("priceCurrency"),
    transportIncluded: getBoolean(formData, "transportIncluded"),
    transportPrice: formData.get("transportPrice"),
    transportCurrency: formData.get("transportCurrency"),
    year: formData.get("year"),
    status: formData.get("status"),
    isFeatured: getBoolean(formData, "isFeatured"),
    isNew: getBoolean(formData, "isNew"),
    firstRegistrationDate: formData.get("firstRegistrationDate"),
    power: formData.get("power"),
    displacement: formData.get("displacement"),
    engine: formData.get("engine"),
    fuelType: formData.get("fuelType"),
    transmission: formData.get("transmission"),
    gearbox: formData.get("gearbox"),
    mileage: formData.get("mileage"),
    doors: formData.get("doors"),
    seats: formData.get("seats"),
    colorName: formData.get("colorName"),
    colorHex: formData.get("colorHex"),
    registration: formData.get("registration"),
    vin: formData.get("vin"),
    description: formData.get("description"),
    optionIds: formData.getAll("optionIds").map(String),
    existingImages: formData.getAll("existingImages").map(String),
    existingVideos: formData.getAll("existingVideos").map(String),
    existingInspectionReportUrl: formData.get("existingInspectionReportUrl"),
  });
}

function getImageFiles(formData: FormData) {
  return formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0);
}

async function saveImageFiles(files: File[]) {
  if (files.length > MAX_VEHICLE_IMAGES) {
    throw new Error(`Maximum ${MAX_VEHICLE_IMAGES} images autorisees.`);
  }

  const urls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Tous les fichiers doivent etre des images.");
    }

    const asset = await saveMediaFile(file, {
      directory: "vehicles",
      maxSizeMb: 8,
      source: "vehicle",
    });
    urls.push(asset.localPath);
  }

  return urls;
}

function getVideoFiles(formData: FormData) {
  return formData
    .getAll("videos")
    .filter((file): file is File => file instanceof File && file.size > 0);
}

function getInspectionReportFile(formData: FormData) {
  const file = formData.get("inspectionReport");

  return file instanceof File && file.size > 0 ? file : null;
}

function sanitizeFilename(value: string) {
  const baseName = path.parse(value).name || "video";

  return baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "video";
}

function getVideoExtension(file: File) {
  if (file.type === "video/mp4") return ".mp4";
  if (file.type === "video/webm") return ".webm";
  if (file.type === "video/quicktime") return ".mov";

  return path.extname(file.name).toLowerCase() || ".mp4";
}

async function saveVideoFiles(files: File[]) {
  if (files.length > MAX_VEHICLE_VIDEOS) {
    throw new Error(`Maximum ${MAX_VEHICLE_VIDEOS} videos autorisees.`);
  }

  const maxSizeMb = 80;
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "vehicles",
    "videos",
  );
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];
  const prisma = getPrisma();

  for (const file of files) {
    if (!allowedVideoTypes.has(file.type)) {
      throw new Error("Les videos doivent etre au format MP4, WebM ou MOV.");
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      throw new Error(`Chaque video ne doit pas depasser ${maxSizeMb} Mo.`);
    }

    const extension = getVideoExtension(file);
    const filename = `${Date.now()}-${crypto.randomUUID()}-${sanitizeFilename(file.name)}${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const absolutePath = path.join(uploadDir, filename);

    await writeFile(absolutePath, bytes);

    const localPath = `/uploads/vehicles/videos/${filename}`;
    await prisma.mediaAsset.create({
      data: {
        filename,
        localPath,
        mimeType: file.type,
        originalName: file.name || filename,
        publicUrl: getMediaUrl(localPath),
        size: bytes.length,
        source: "vehicle-video",
        title: path.parse(file.name || filename).name || null,
      },
    });
    urls.push(localPath);
  }

  return urls;
}

function normalizeYouTubeUrl(value: string) {
  const cleanValue = value.trim();
  if (!cleanValue) return "";

  try {
    const url = new URL(cleanValue);
    const host = url.hostname.replace(/^www\./, "");
    const isYouTubeHost =
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtu.be" ||
      host === "youtube-nocookie.com";

    if (!isYouTubeHost) return cleanValue;

    if (host === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/watch?v=${videoId}` : cleanValue;
    }

    const videoId = url.searchParams.get("v");
    if (videoId) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }

    const embedMatch = url.pathname.match(/\/(?:embed|shorts)\/([^/?#]+)/);
    return embedMatch?.[1]
      ? `https://www.youtube.com/watch?v=${embedMatch[1]}`
      : cleanValue;
  } catch {
    return cleanValue;
  }
}

function normalizeStoredVideos(values: string[]) {
  return values
    .map((value) => normalizeYouTubeUrl(value))
    .filter(Boolean);
}

async function saveInspectionReportFile(file: File | null) {
  if (!file) return null;

  const maxSizeMb = 20;

  if (!allowedReportTypes.has(file.type)) {
    throw new Error("Le rapport d'inspection doit etre un fichier PDF.");
  }

  if (file.size > maxSizeMb * 1024 * 1024) {
    throw new Error(`Le rapport d'inspection ne doit pas depasser ${maxSizeMb} Mo.`);
  }

  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "vehicles",
    "reports",
  );
  await mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${crypto.randomUUID()}-${sanitizeFilename(file.name)}.pdf`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const absolutePath = path.join(uploadDir, filename);

  await writeFile(absolutePath, bytes);

  const localPath = `/uploads/vehicles/reports/${filename}`;
  const prisma = getPrisma();
  await prisma.mediaAsset.create({
    data: {
      filename,
      localPath,
      mimeType: "application/pdf",
      originalName: file.name || filename,
      publicUrl: getMediaUrl(localPath),
      size: bytes.length,
      source: "vehicle-inspection-report",
      title: path.parse(file.name || filename).name || "Rapport d'inspection",
    },
  });

  return localPath;
}

function toPrismaVehicleBaseData(
  data: ReturnType<typeof vehicleSchema.parse>,
  images: string[],
  videos: string[],
  inspectionReportUrl: string | null,
) {
  return {
    title: data.title,
    slug: data.slug,
    brandId: data.brandId,
    categoryId: data.categoryId || null,
    model: data.model || null,
    generation: data.generation || null,
    trim: data.trim || null,
    engineCode: data.engineCode || null,
    motorization: data.motorization || null,
    price: data.price,
    priceCurrency: data.priceCurrency,
    transportIncluded: data.transportIncluded,
    transportPrice: data.transportIncluded ? null : data.transportPrice || null,
    transportCurrency: data.transportCurrency,
    year: data.year,
    firstRegistrationDate: data.firstRegistrationDate
      ? new Date(`${data.firstRegistrationDate}T00:00:00.000Z`)
      : null,
    mileage: data.mileage,
    power: data.power,
    displacement: data.displacement || null,
    engine: data.engine,
    transmission: data.transmission,
    fuelType: data.fuelType ? (data.fuelType as FuelType) : null,
    gearbox: data.gearbox || null,
    color: data.colorName
      ? `${data.colorName} (${data.colorHex || "#111111"})`
      : null,
    registration: data.registration || null,
    vin: data.vin || null,
    doors: data.doors,
    seats: data.seats,
    status: data.status,
    isFeatured: data.isFeatured,
    isNew: data.isNew,
    description: data.description || null,
    images,
    videos,
    inspectionReportUrl,
  };
}

function actionError(error: unknown): VehicleActionState {
  if (error instanceof Error) {
    return { ok: false, message: error.message };
  }

  return { ok: false, message: "Une erreur est survenue." };
}

export async function createVehicle(
  _state: VehicleActionState,
  formData: FormData,
): Promise<VehicleActionState> {
  try {
    await ensureAdmin();

    const parsed = getVehiclePayload(formData);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Veuillez corriger les champs du formulaire.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const imageFiles = getImageFiles(formData);
    const videoFiles = getVideoFiles(formData);
    const inspectionReportFile = getInspectionReportFile(formData);
    const existingVideos = normalizeStoredVideos(parsed.data.existingVideos);

    if (parsed.data.existingImages.length + imageFiles.length > MAX_VEHICLE_IMAGES) {
      return {
        ok: false,
        message: `Maximum ${MAX_VEHICLE_IMAGES} images autorisees.`,
        fieldErrors: { images: [`Maximum ${MAX_VEHICLE_IMAGES} images autorisees.`] },
      };
    }

    if (existingVideos.length + videoFiles.length > MAX_VEHICLE_VIDEOS) {
      return {
        ok: false,
        message: `Maximum ${MAX_VEHICLE_VIDEOS} videos autorisees.`,
        fieldErrors: { videos: [`Maximum ${MAX_VEHICLE_VIDEOS} videos autorisees.`] },
      };
    }

    const uploadedImages = await saveImageFiles(imageFiles);
    const uploadedVideos = await saveVideoFiles(videoFiles);
    const uploadedInspectionReport =
      await saveInspectionReportFile(inspectionReportFile);
    const inspectionReportUrl =
      uploadedInspectionReport || parsed.data.existingInspectionReportUrl || null;
    const images = [...parsed.data.existingImages, ...uploadedImages].slice(
      0,
      MAX_VEHICLE_IMAGES,
    );
    const videos = [...existingVideos, ...uploadedVideos].slice(
      0,
      MAX_VEHICLE_VIDEOS,
    );

    const prisma = getPrisma();

    const vehicle = await prisma.vehicle.create({
      data: {
        ...toPrismaVehicleBaseData(
          parsed.data,
          images,
          videos,
          inspectionReportUrl,
        ),
        options: {
          connect: parsed.data.optionIds.map((id) => ({ id })),
        },
      },
    });

    revalidatePath("/admin/vehicles");
    revalidatePath("/");
    revalidatePath("/categories");
    revalidatePath("/marques");
    revalidateTag("public-brand-links", "max");
    revalidatePath(`/vehicles/${vehicle.slug}`);

    return {
      ok: true,
      message: "Vehicule ajoute avec succes.",
      redirectTo: "/admin/vehicles",
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateVehicle(
  id: string,
  _state: VehicleActionState,
  formData: FormData,
): Promise<VehicleActionState> {
  try {
    await ensureAdmin();

    const parsed = getVehiclePayload(formData);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Veuillez corriger les champs du formulaire.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const imageFiles = getImageFiles(formData);
    const videoFiles = getVideoFiles(formData);
    const inspectionReportFile = getInspectionReportFile(formData);
    const existingVideos = normalizeStoredVideos(parsed.data.existingVideos);

    if (parsed.data.existingImages.length + imageFiles.length > MAX_VEHICLE_IMAGES) {
      return {
        ok: false,
        message: `Maximum ${MAX_VEHICLE_IMAGES} images autorisees.`,
        fieldErrors: { images: [`Maximum ${MAX_VEHICLE_IMAGES} images autorisees.`] },
      };
    }

    if (existingVideos.length + videoFiles.length > MAX_VEHICLE_VIDEOS) {
      return {
        ok: false,
        message: `Maximum ${MAX_VEHICLE_VIDEOS} videos autorisees.`,
        fieldErrors: { videos: [`Maximum ${MAX_VEHICLE_VIDEOS} videos autorisees.`] },
      };
    }

    const uploadedImages = await saveImageFiles(imageFiles);
    const uploadedVideos = await saveVideoFiles(videoFiles);
    const uploadedInspectionReport =
      await saveInspectionReportFile(inspectionReportFile);
    const inspectionReportUrl =
      uploadedInspectionReport || parsed.data.existingInspectionReportUrl || null;
    const images = [...parsed.data.existingImages, ...uploadedImages].slice(
      0,
      MAX_VEHICLE_IMAGES,
    );
    const videos = [...existingVideos, ...uploadedVideos].slice(
      0,
      MAX_VEHICLE_VIDEOS,
    );

    const prisma = getPrisma();
    const currentVehicle = await prisma.vehicle.findUnique({
      select: { slug: true },
      where: { id },
    });

    await prisma.vehicle.update({
      where: { id },
      data: {
        ...toPrismaVehicleBaseData(
          parsed.data,
          images,
          videos,
          inspectionReportUrl,
        ),
        options: {
          set: parsed.data.optionIds.map((id) => ({ id })),
        },
      },
    });

    revalidatePath("/admin/vehicles");
    revalidatePath(`/admin/vehicles/${id}/edit`);
    revalidatePath("/");
    revalidatePath("/categories");
    revalidatePath("/marques");
    revalidateTag("public-brand-links", "max");
    revalidatePath(`/vehicles/${parsed.data.slug}`);
    if (currentVehicle?.slug && currentVehicle.slug !== parsed.data.slug) {
      revalidatePath(`/vehicles/${currentVehicle.slug}`);
    }

    return {
      ok: true,
      message: "Vehicule modifie avec succes.",
      redirectTo: "/admin/vehicles",
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteVehicleAction(formData: FormData) {
  await ensureAdmin();

  const [id] = getIds(formData);
  const prisma = getPrisma();
  const vehicle = await prisma.vehicle.findUnique({
    select: { slug: true },
    where: { id },
  });

  await prisma.$transaction([
    prisma.purchaseRequest.deleteMany({ where: { vehicleId: id } }),
    prisma.vehicle.delete({ where: { id } }),
  ]);

  revalidatePath("/admin/vehicles");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/marques");
  revalidateTag("public-brand-links", "max");
  if (vehicle?.slug) {
    revalidatePath(`/vehicles/${vehicle.slug}`);
  }
}

export async function deleteVehiclesAction(formData: FormData) {
  await ensureAdmin();

  const ids = getIds(formData);
  const prisma = getPrisma();

  await prisma.$transaction([
    prisma.purchaseRequest.deleteMany({ where: { vehicleId: { in: ids } } }),
    prisma.vehicle.deleteMany({ where: { id: { in: ids } } }),
  ]);

  revalidatePath("/admin/vehicles");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/marques");
  revalidateTag("public-brand-links", "max");
}

export async function markVehicleAsDraftAction(formData: FormData) {
  await ensureAdmin();

  const [id] = getIds(formData);
  const prisma = getPrisma();

  const vehicle = await prisma.vehicle.update({
    data: { status: "BROUILLON" },
    select: { slug: true },
    where: { id },
  });

  revalidatePath("/admin/vehicles");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/marques");
  revalidateTag("public-brand-links", "max");
  revalidatePath(`/vehicles/${vehicle.slug}`);
}
