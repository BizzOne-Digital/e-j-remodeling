import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/services", "/testimonials", "/booking", "/contact", "/privacy-policy", "/terms-and-conditions"].map((p) => ({ url: siteUrl() + p, priority: p === "/" ? 1 : p.includes("-") ? 0.2 : 0.8 }));
}
