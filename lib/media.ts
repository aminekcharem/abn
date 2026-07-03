import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { getMediaUrl } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
]);

type SaveMediaFileOptions = {
  alt?: string | null;
  caption?: string | null;
  directory?: string;
  maxSizeMb?: number;
  source?: string;
  title?: string | null;
};

function getExtension(file: File) {
  if (file.type === "image/jpeg" || file.type === "image/png") {
    return ".webp";
  }

  if (file.type === "image/svg+xml") {
    return ".svg";
  }

  if (file.type === "image/webp") {
    return ".webp";
  }

  return path.extname(file.name).toLowerCase() || ".webp";
}

function sanitizeFilename(value: string) {
  const baseName = path.parse(value).name || "media";

  return baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "media";
}

async function getImageBuffer(file: File) {
  const input = Buffer.from(await file.arrayBuffer());

  if (file.type === "image/jpeg" || file.type === "image/png") {
    return sharp(input)
      .rotate()
      .webp({ effort: 5, quality: 82 })
      .toBuffer();
  }

  return input;
}

export async function saveMediaFile(
  file: File,
  options: SaveMediaFileOptions = {},
) {
  const maxSizeMb = options.maxSizeMb ?? 8;

  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Le fichier doit etre une image PNG, JPG, JPEG, SVG ou WebP.");
  }

  if (file.size > maxSizeMb * 1024 * 1024) {
    throw new Error(`L'image ne doit pas depasser ${maxSizeMb} Mo.`);
  }

  const directory = options.directory ?? "media";
  const uploadDir = path.join(process.cwd(), "public", "uploads", directory);
  await mkdir(uploadDir, { recursive: true });

  const extension = getExtension(file);
  const filename = `${Date.now()}-${crypto.randomUUID()}-${sanitizeFilename(file.name)}${extension}`;
  const bytes = await getImageBuffer(file);
  const absolutePath = path.join(uploadDir, filename);

  await writeFile(absolutePath, bytes);

  let width: number | null = null;
  let height: number | null = null;

  if (file.type !== "image/svg+xml") {
    const metadata = await sharp(bytes).metadata();
    width = metadata.width ?? null;
    height = metadata.height ?? null;
  }

  const localPath = `/uploads/${directory}/${filename}`;
  const publicUrl = getMediaUrl(localPath);
  const prisma = getPrisma();
  const defaultTitle = path.parse(file.name || filename).name;
  const asset = await prisma.mediaAsset.create({
    data: {
      alt: options.alt?.trim() || null,
      caption: options.caption?.trim() || null,
      filename,
      height,
      localPath,
      mimeType: extension === ".webp" ? "image/webp" : file.type,
      originalName: file.name || filename,
      publicUrl,
      size: bytes.length,
      source: options.source,
      title: options.title?.trim() || defaultTitle || null,
      width,
    },
  });

  return asset;
}
