import type { Metadata } from "next";
import { getSite } from "./content";
import { siteUrl } from "./utils";

export async function pageMeta(page: "home" | "services" | "testimonials" | "booking" | "contact", path: string): Promise<Metadata> {
  const { settings: s } = await getSite();
  const title = s.seo[`${page}Title`], description = s.seo[`${page}Description`];
  const images = [{ url: s.seo.shareImage || "/images/og-image.webp", width: 1200, height: 630, alt: s.businessName }];
  return {
    title, description, alternates: { canonical: siteUrl() + path },
    openGraph: { type: "website", url: siteUrl() + path, siteName: s.businessName, title, description, locale: "en_US", images },
    twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
  };
}
