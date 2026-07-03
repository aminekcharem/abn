const cdnBaseUrl =
  process.env.NEXT_PUBLIC_MEDIA_CDN_URL || process.env.MEDIA_CDN_URL || "";

function normalizeCdnBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function getMediaUrl(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) return "";

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedBaseUrl = normalizeCdnBaseUrl(cdnBaseUrl);

  if (!normalizedBaseUrl) {
    return pathOrUrl;
  }

  return `${normalizedBaseUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export function isCdnConfigured() {
  return Boolean(normalizeCdnBaseUrl(cdnBaseUrl));
}
