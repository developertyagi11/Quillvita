import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private, signed-in pages and API routes. Sign-in pages stay crawlable so their `noindex` is seen.
      disallow: ["/history", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
