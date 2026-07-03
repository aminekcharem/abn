import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function getUploadsRoot() {
  return path.join(/* turbopackIgnore: true */ process.cwd(), "public", "uploads");
}

function getUploadFilePath(segments: string[]) {
  if (
    !segments.length ||
    segments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        segment.includes("/") ||
        segment.includes("\\"),
    )
  ) {
    return null;
  }

  return path.join(getUploadsRoot(), ...segments);
}

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/uploads/[...path]">,
) {
  const { path: segments } = await context.params;
  const filePath = getUploadFilePath(segments);

  if (!filePath) {
    notFound();
  }

  const fileStats = await stat(filePath).catch(() => null);

  if (!fileStats?.isFile()) {
    notFound();
  }

  const file = await readFile(filePath);
  const extension = path.extname(filePath).toLowerCase();
  const contentType = contentTypes[extension] ?? "application/octet-stream";

  return new Response(file, {
    headers: {
      "Cache-Control": "public, max-age=0",
      "Content-Length": String(fileStats.size),
      "Content-Type": contentType,
    },
  });
}
