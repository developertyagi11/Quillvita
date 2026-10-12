import type { LucideIcon } from "lucide-react";
import { ClipboardPaste, FileDown, FileUp } from "lucide-react";

import { SectionHeading } from "@/components/features/landing/SectionHeading";

const STEPS: readonly {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
}[] = [
  {
    icon: ClipboardPaste,
    title: "Paste the job description",
    description:
      "Copy the whole posting. Quillvita picks out the requirements, the tools and the language the employer uses.",
  },
  {
    icon: FileUp,
    title: "Upload your resume",
    description:
      "PDF or DOCX up to 5 MB. Choose which sections may change: summary, skills, experience or projects.",
  },
  {
    icon: FileDown,
    title: "Review, then download",
    description:
      "Check the scores and every change with its reason, then export to PDF, DOCX or plain text.",
  },
];

export function HowItWorks(): React.JSX.Element {
  return (
    <section aria-labelledby="how-it-works-heading" id="how-it-works">
      <div className="mx-auto flex max-w-content flex-col gap-xl px-md py-xxl sm:px-lg sm:py-section">
        <SectionHeading
          id="how-it-works-heading"
          eyebrow="How it works"
          title="Three steps, about a minute."
          description="No templates to fill in and no account to create. Bring the resume you already have."
        />
        <ol className="grid gap-md md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="flex flex-col gap-md rounded-lg border border-hairline bg-surface-1 p-lg shadow-edge"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-md border border-hairline bg-surface-2 text-ink-muted">
                    <Icon aria-hidden size={18} />
                  </span>
                  <span className="font-mono text-mono text-ink-tertiary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-col gap-xs">
                  <h3 className="text-body-lg font-medium text-ink">{step.title}</h3>
                  <p className="text-body-sm text-ink-subtle">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
