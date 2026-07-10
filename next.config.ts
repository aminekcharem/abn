import type { NextConfig } from "next";

const mediaCdnUrl =
  process.env.NEXT_PUBLIC_MEDIA_CDN_URL || process.env.MEDIA_CDN_URL;

const nextConfig: NextConfig = {
  compress: true,
  output: "standalone",
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "1gb",
    },
  },
  images: {
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536],
    formats: ["image/avif", "image/webp"],
    imageSizes: [32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 604800,
    qualities: [60, 75],
    ...(mediaCdnUrl
      ? {
          remotePatterns: [
            {
              hostname: new URL(mediaCdnUrl).hostname,
              pathname: "/**",
              protocol: new URL(mediaCdnUrl).protocol.replace(":", "") as
                | "http"
                | "https",
            },
          ],
        }
      : {}),
  },
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
