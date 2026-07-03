import type { NextConfig } from "next";

const mediaCdnUrl =
  process.env.NEXT_PUBLIC_MEDIA_CDN_URL || process.env.MEDIA_CDN_URL;

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "1gb",
    },
  },
  images: mediaCdnUrl
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
    : undefined,
};

export default nextConfig;
