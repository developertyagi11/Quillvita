import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";

export function FinalCta(): React.JSX.Element {
  return (
    <section aria-labelledby="final-cta-heading" className="border-t border-hairline">
      <div className="mx-auto max-w-content px-md py-xxl sm:px-lg sm:py-section">
        <div className="flex flex-col items-center gap-lg rounded-lg border border-hairline bg-surface-1 px-lg py-xxl text-center shadow-edge sm:px-xxl">
          <h2
            id="final-cta-heading"
            className="max-w-2xl text-balance font-display text-headline text-ink sm:text-display-md"
          >
            Your next application deserves a resume written for it.
          </h2>
          <p className="max-w-lead text-body text-ink-subtle sm:text-body-lg">
            Paste the job, upload your resume, and get a tailored version in about a minute.
          </p>
          <div className="flex w-full flex-col items-center gap-sm sm:w-auto">
            <ButtonLink href={ROUTES.tailor} variant="primary" className="h-11 w-full sm:w-auto">
              Tailor my resume
              <ArrowRight aria-hidden size={16} />
            </ButtonLink>
            <p className="text-caption text-ink-tertiary">Free. No account needed.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
