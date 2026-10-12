import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check, History, Lock } from "lucide-react";

import { SectionHeading } from "@/components/features/landing/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";

const PLANS: readonly {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
  readonly points: readonly string[];
  readonly featured: boolean;
}[] = [
  {
    icon: Lock,
    title: "Without an account",
    description: "Tailor as many resumes as you like, with nothing kept afterwards.",
    points: [
      "Your file is processed in memory",
      "Nothing is saved once you leave the page",
      "All features, including cover letters and exports",
    ],
    featured: false,
  },
  {
    icon: History,
    title: "With a free account",
    description: "Keep a history of every resume you tailor.",
    points: [
      "Each run saved with its scores and changes",
      "Reopen results and download the original file again",
      "Delete any entry, file included, whenever you want",
    ],
    featured: true,
  },
];

export function PrivacySection(): React.JSX.Element {
  return (
    <section aria-labelledby="privacy-heading" className="border-t border-hairline">
      <div className="mx-auto flex max-w-content flex-col gap-xl px-md py-xxl sm:px-lg sm:py-section">
        <SectionHeading
          id="privacy-heading"
          eyebrow="Your data"
          title="Use it anonymously, or keep a history."
          description="Signing in is optional. It only adds a place to come back to."
        />
        <div className="grid gap-md md:grid-cols-2">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <article
                key={plan.title}
                className={cn(
                  "flex flex-col gap-lg rounded-lg border p-lg shadow-edge sm:p-xl",
                  plan.featured
                    ? "border-hairline-strong bg-surface-2"
                    : "border-hairline bg-surface-1",
                )}
              >
                <div className="flex items-start gap-md">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-3 text-ink-muted">
                    <Icon aria-hidden size={18} />
                  </span>
                  <div className="flex flex-col gap-xxs">
                    <h3 className="text-body-lg font-medium text-ink">{plan.title}</h3>
                    <p className="text-body-sm text-ink-subtle">{plan.description}</p>
                  </div>
                </div>
                <ul className="flex flex-col gap-sm border-t border-hairline pt-lg">
                  {plan.points.map((point) => (
                    <li key={point} className="flex items-start gap-sm text-body-sm text-ink-muted">
                      <Check aria-hidden size={16} className="mt-0.5 shrink-0 text-success" />
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  {plan.featured ? (
                    <ButtonLink href={ROUTES.signUp} className="w-full sm:w-auto">
                      Create a free account
                      <ArrowRight aria-hidden size={16} />
                    </ButtonLink>
                  ) : (
                    <ButtonLink
                      href={ROUTES.tailor}
                      variant="tertiary"
                      className="w-full sm:w-auto"
                    >
                      Start without signing in
                    </ButtonLink>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
