import { ChevronDown } from "lucide-react";

import { SectionHeading } from "@/components/features/landing/SectionHeading";

/** Also published as FAQPage structured data, so keep answers plain text. */
export const FAQ_ITEMS: readonly { readonly question: string; readonly answer: string }[] = [
  {
    question: "Is Quillvita free?",
    answer:
      "Yes. There's no paywall and no credit card. It runs on free AI tiers, so at very busy moments you may be asked to try again in a minute.",
  },
  {
    question: "Will it make things up?",
    answer:
      "It's built not to. The AI is told to only rephrase and reorder, and the server then checks the result: new skills, tools or vague numbers that aren't in your resume are rolled back, and your contact details and education are copied exactly. Always give the result a final read before you send it.",
  },
  {
    question: "Which files can I upload?",
    answer:
      "PDF and DOCX files up to 5 MB with selectable text. Scanned PDFs (pictures of text) and old .doc files aren't supported yet.",
  },
  {
    question: "Do you store my resume?",
    answer:
      "Not unless you sign in. Without an account, your file is processed in memory and discarded. With an account, the file and its results are saved so you can reopen them, and deleting an entry removes both.",
  },
  {
    question: "How long does it take?",
    answer:
      "Usually 15 to 40 seconds. If nobody has used the app for a while, the first request can take up to a minute while the server wakes up.",
  },
  {
    question: "Does it guarantee I'll pass an ATS?",
    answer:
      "No tool can promise that. The ATS score is an AI estimate based on keywords and structure, and the exports use a clean single-column layout that applicant tracking systems read reliably.",
  },
];

export function Faq(): React.JSX.Element {
  return (
    <section aria-labelledby="faq-heading" id="faq" className="border-t border-hairline">
      <div className="mx-auto grid max-w-content gap-xl px-md py-xxl sm:px-lg sm:py-section lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-xxl">
        <SectionHeading
          id="faq-heading"
          eyebrow="FAQ"
          title="Questions, answered."
          description="Anything else? The tool explains each step as you go."
        />
        <div className="border-t border-hairline">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group border-b border-hairline">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-md rounded-sm py-md text-body font-medium text-ink [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown
                  aria-hidden
                  size={18}
                  className="shrink-0 text-ink-subtle transition-transform duration-base ease-standard group-open:rotate-180"
                />
              </summary>
              <p className="pb-md pr-xl text-body-sm text-ink-subtle">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
