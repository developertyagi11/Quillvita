import type { Metadata } from "next";

const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

/**
 * Public origin used for canonical URLs, Open Graph tags, the sitemap and robots.txt.
 * Falls back to Vercel's production domain (set automatically at build time) and then localhost.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (vercelProductionHost ? `https://${vercelProductionHost}` : "http://localhost:3000")
).replace(/\/+$/, "");

export const SITE_NAME = "Quillvita";
export const SITE_TITLE = "Quillvita: Free AI resume tailoring that never invents experience";
export const SITE_DESCRIPTION =
  "Tailor your resume to any job description in under a minute. Quillvita rewrites your PDF or DOCX resume in the employer's language, scores the match and ATS readiness, flags missing keywords and explains every change, without inventing anything.";
export const BRAND_COLOR = "#5e6ad2";
export const CANVAS_COLOR = "#010102";
export const OG_IMAGE_ALT =
  "Quillvita: tailor your resume to every job without inventing a thing. Match score, ATS readiness, missing keywords and every change explained.";
/** Served by `app/opengraph-image.tsx`. Pages that set `openGraph` don't inherit it, so they list it. */
const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: OG_IMAGE_ALT };

interface PublicPage {
  readonly path: string;
  /** Full document title; omit to use the site default. */
  readonly title?: string;
  readonly description?: string;
}

/** Canonical URL plus matching Open Graph and Twitter fields for an indexable page. */
export function publicPageMetadata({ path, title, description }: PublicPage): Metadata {
  const shareTitle = title ?? SITE_TITLE;
  const shareDescription = description ?? SITE_DESCRIPTION;
  return {
    ...(title ? { title: { absolute: title } } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
      title: shareTitle,
      description: shareDescription,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: shareDescription,
      images: [OG_IMAGE],
    },
  };
}

/** For pages that must not appear in search results (sign-in, private history). */
export const NO_INDEX: Metadata["robots"] = { index: false, follow: true };
