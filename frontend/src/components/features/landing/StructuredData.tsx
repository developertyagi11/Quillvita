import { FAQ_ITEMS } from "@/components/features/landing/Faq";
import { ROUTES } from "@/lib/routes";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: `${SITE_URL}${ROUTES.tailor}`,
      description: SITE_DESCRIPTION,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Tailors PDF and DOCX resumes to a job description",
        "Job match and ATS readiness scores with tips",
        "Missing keywords with reasons",
        "Every change explained, with a side-by-side diff",
        "Optional cover letter",
        "DOCX, PDF and TXT downloads",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

/** JSON-LD for search engines. `<` is escaped so the payload can't close the script tag. */
export function StructuredData(): React.JSX.Element {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(STRUCTURED_DATA).replace(/</g, "\\u003c"),
      }}
    />
  );
}
