import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";
/** /admin and /payment carry an X-Robots-Tag noindex header; they stay crawlable so that header can be seen. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: ["/", "/api/uploads/"], disallow: "/api/" }, sitemap: siteUrl() + "/sitemap.xml" };
}
