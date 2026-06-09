import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private / user-specific surfaces have no SEO value and shouldn't be crawled.
      disallow: [
        "/auth/",
        "/login",
        "/signup",
        "/profile",
        "/favorites",
        "/reset-password",
        "/update-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
