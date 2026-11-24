import type { NextConfig } from "next";
import path from "node:path";

const dev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${dev ? " ws:" : ""}`,
  "frame-src https://www.google.com",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const config: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: path.resolve(process.cwd()) },
  serverExternalPackages: ["mongoose", "nodemailer"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    localPatterns: [{ pathname: "/images/**" }, { pathname: "/api/uploads/**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
        ],
      },
      { source: "/admin/:path*", headers: [...noindex, { key: "Cache-Control", value: "no-store" }] },
      { source: "/payment/:path*", headers: [...noindex, { key: "Referrer-Policy", value: "same-origin" }] },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
};
export default config;
