import type { LucideIcon } from "lucide-react";
import { FileDown, Gauge, GitCompareArrows, ListChecks, Mail, Search } from "lucide-react";

import { SectionHeading } from "@/components/features/landing/SectionHeading";

const FEATURES: readonly {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
}[] = [
  {
    icon: Gauge,
    title: "Match and ATS scores",
    description:
      "Two scores out of 100, a short justification, and concrete tips for raising your ATS score.",
  },
  {
    icon: Search,
    title: "Missing keywords, with reasons",
    description:
      "See which requirements your resume doesn't show yet and why each one matters. Add them only if they're true.",
  },
  {
    icon: ListChecks,
    title: "Every change explained",
    description:
      "Each rewrite comes with the before, the after and the reason, so you decide what stays.",
  },
  {
    icon: GitCompareArrows,
    title: "Side-by-side compare",
    description: "A word-level diff of your original and the tailored version, section by section.",
  },
  {
    icon: Mail,
    title: "Cover letter in one click",
    description:
      "Turn the tailored resume into a cover letter in a professional, enthusiastic or concise tone.",
  },
  {
    icon: FileDown,
    title: "Export anywhere",
    description:
      "Download a clean, ATS-friendly PDF, DOCX or plain-text file, or copy it straight into a form.",
  },
];

export function FeatureGrid(): React.JSX.Element {
  return (
    <section aria-labelledby="features-heading" id="features" className="border-t border-hairline">
      <div className="mx-auto flex max-w-content flex-col gap-xl px-md py-xxl sm:px-lg sm:py-section">
        <SectionHeading
          id="features-heading"
          eyebrow="Features"
          title="Everything you need to send a stronger application."
          description="One run gives you a rewritten resume and the reasoning behind it."
        />
        <ul className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <li
                key={feature.title}
                className="flex flex-col gap-md rounded-lg border border-hairline bg-surface-1 p-lg shadow-edge transition-colors duration-base ease-standard hover:border-hairline-strong hover:bg-surface-2"
              >
                <span className="flex size-10 items-center justify-center rounded-md border border-hairline bg-surface-2 text-ink-muted">
                  <Icon aria-hidden size={18} />
                </span>
                <div className="flex flex-col gap-xs">
                  <h3 className="text-body-lg font-medium text-ink">{feature.title}</h3>
                  <p className="text-body-sm text-ink-subtle">{feature.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
