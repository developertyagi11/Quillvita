import { Ban, Check } from "lucide-react";

import { SectionHeading } from "@/components/features/landing/SectionHeading";
import { Badge } from "@/components/ui/Badge";

const RULES = [
  "Never adds employers, job titles, dates, degrees or numbers you didn't write.",
  "Keeps a skill only if your resume already shows it.",
  "Copies your name, contact details and education exactly.",
  "Leaves the sections you don't select word for word.",
] as const;

export function HonestSection(): React.JSX.Element {
  return (
    <section aria-labelledby="honest-heading" id="honest" className="border-t border-hairline">
      <div className="mx-auto grid max-w-content items-center gap-xl px-md py-xxl sm:px-lg sm:py-section lg:grid-cols-2 lg:gap-xxl">
        <div className="flex flex-col gap-lg">
          <SectionHeading
            id="honest-heading"
            eyebrow="Honest by design"
            title="Rephrased, never invented."
            description="Recruiters notice made-up experience. Quillvita only rewords and reorders what you've actually done, and checks its own output before you see it."
          />
          <ul className="flex flex-col gap-sm">
            {RULES.map((rule) => (
              <li key={rule} className="flex items-start gap-sm text-body-sm text-ink-muted">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-success/40 text-success">
                  <Check aria-hidden size={12} />
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        <div aria-hidden className="flex min-w-0 flex-col gap-md">
          <div className="rounded-lg border border-hairline bg-surface-1 p-lg shadow-edge">
            <div className="flex flex-wrap items-center justify-between gap-xs">
              <p className="text-eyebrow uppercase text-ink-tertiary">Change · Summary</p>
              <Badge tone="success">Kept</Badge>
            </div>
            <p className="mt-md text-body-sm text-ink-tertiary line-through">
              Developer who builds websites and improves performance.
            </p>
            <p className="mt-xs text-body-sm text-ink">
              Frontend engineer who builds React applications and cut page load time by 35%.
            </p>
            <p className="mt-sm text-caption text-ink-subtle">
              Uses the posting&apos;s wording and a result already listed under Experience.
            </p>
          </div>
          <div className="rounded-lg border border-hairline bg-surface-1 p-lg shadow-edge">
            <div className="flex flex-wrap items-center justify-between gap-xs">
              <p className="text-eyebrow uppercase text-ink-tertiary">Change · Skills</p>
              <Badge tone="warning">
                <Ban aria-hidden size={12} />
                Blocked
              </Badge>
            </div>
            <p className="mt-md text-body-sm text-ink">
              <span className="rounded-xs bg-danger/20 px-0.5">Kubernetes</span> was suggested by
              the job description but isn&apos;t anywhere in your resume, so it was left out.
            </p>
            <p className="mt-sm text-caption text-ink-subtle">
              If it matters for the role, it&apos;s listed under missing keywords for you to add
              yourself, if it&apos;s true.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
