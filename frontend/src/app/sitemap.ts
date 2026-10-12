import type { MetadataRoute } from "next";

import { ROUTES } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}${ROUTES.home}`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}${ROUTES.tailor}`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
