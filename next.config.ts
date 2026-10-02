import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      // ── Service Worker ────────────────────────────────────────────────────
      // Must never be cached by the browser itself — the SW manages its own
      // lifecycle. A stale SW byte-for-byte check is how browsers detect updates.
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      // ── PWA Manifest ─────────────────────────────────────────────────────
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      // ── PWA Icons (long-lived) ────────────────────────────────────────────
      {
        source: "/:icon(icon-192x192|icon-512x512|apple-touch-icon).png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
