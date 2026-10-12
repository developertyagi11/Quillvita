import { describe, expect, it } from "vitest";

import { NO_INDEX, publicPageMetadata, SITE_DESCRIPTION, SITE_TITLE } from "./site";

describe("publicPageMetadata", () => {
  it("sets the canonical URL and share URL to the page path", () => {
    const metadata = publicPageMetadata({ path: "/tailor" });
    expect(metadata.alternates?.canonical).toBe("/tailor");
    expect(metadata.openGraph).toMatchObject({ url: "/tailor" });
  });

  it("always lists the Open Graph image, which child pages would otherwise lose", () => {
    const metadata = publicPageMetadata({ path: "/tailor" });
    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({ url: "/opengraph-image", width: 1200, height: 630 }),
    ]);
    expect(metadata.twitter?.images).toEqual(metadata.openGraph?.images);
  });

  it("uses the site defaults when no title or description is given", () => {
    const metadata = publicPageMetadata({ path: "/" });
    expect(metadata.title).toBeUndefined();
    expect(metadata.openGraph).toMatchObject({ title: SITE_TITLE, description: SITE_DESCRIPTION });
  });

  it("uses a custom title as-is, without the site template", () => {
    const metadata = publicPageMetadata({ path: "/tailor", title: "Tailor · Quillvita" });
    expect(metadata.title).toEqual({ absolute: "Tailor · Quillvita" });
  });
});

describe("SITE_DESCRIPTION", () => {
  it("fits in a search result snippet without being cut off", () => {
    expect(SITE_DESCRIPTION.length).toBeLessThanOrEqual(155);
  });
});

describe("NO_INDEX", () => {
  it("keeps pages out of search results but lets crawlers follow links", () => {
    expect(NO_INDEX).toEqual({ index: false, follow: true });
  });
});
