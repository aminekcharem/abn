const cdnBaseUrl =
  process.env.NEXT_PUBLIC_MEDIA_CDN_URL || process.env.MEDIA_CDN_URL || "";

function normalizeCdnBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function normalizeMediaPath(pathOrUrl: string) {
  const normalizedPath = pathOrUrl.trim().replace(/\\/g, "/");
  const publicUploadsIndex = normalizedPath.toLowerCase().lastIndexOf("/public/uploads/");

  if (publicUploadsIndex >= 0) {
    return normalizedPath.slice(publicUploadsIndex + "/public".length);
  }

  if (normalizedPath.toLowerCase().startsWith("public/uploads/")) {
    return `/${normalizedPath.slice("public/".length)}`;
  }

  if (normalizedPath.toLowerCase().startsWith("uploads/")) {
    return `/${normalizedPath}`;
  }

  return normalizedPath;
}

export function getMediaUrl(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) return "";

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = normalizeMediaPath(pathOrUrl);
  const normalizedBaseUrl = normalizeCdnBaseUrl(cdnBaseUrl);

  if (!normalizedBaseUrl) {
    return normalizedPath;
  }

  return `${normalizedBaseUrl}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
}

export function isCdnConfigured() {
  return Boolean(normalizeCdnBaseUrl(cdnBaseUrl));
}
