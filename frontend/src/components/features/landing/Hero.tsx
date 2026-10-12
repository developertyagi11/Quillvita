import { ArrowRight, Check } from "lucide-react";

import { ProductPreview } from "@/components/features/landing/ProductPreview";
import { ButtonLink } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";

const HIGHLIGHTS = [
  "PDF or DOCX",
  "Results in under a minute",
  "Not stored unless you sign in",
] as const;

export function Hero(): React.JSX.Element {
  return (
    <section aria-labelledby="hero-heading" className="border-b border-hairline">
      <div className="mx-auto max-w-content px-md pb-xxl pt-xxl sm:px-lg sm:pt-section lg:pb-section">
        <div className="flex max-w-4xl flex-col items-start gap-lg">
          <p className="inline-flex items-center gap-xs rounded-pill border border-hairline bg-surface-1 px-sm py-xxs text-caption text-ink-muted">
            <span aria-hidden className="size-1.5 rounded-full bg-success" />
            Free to use · No account needed
          </p>
          <h1
            id="hero-heading"
            className="text-balance font-display text-[34px] font-semibold leading-[1.1] tracking-[-1px] text-ink min-[400px]:text-display-md sm:text-display-lg lg:text-display-xl"
          >
            Tailor your resume to every job.{" "}
            <span className="text-ink-subtle">Without inventing a thing.</span>
          </h1>
          <p className="max-w-2xl text-body text-ink-subtle sm:text-body-lg">
            Paste a job description and upload your resume. Quillvita rewrites it in the
            employer&apos;s language, scores the match, flags the keywords you&apos;re missing and
            explains every change, using only what&apos;s already true.
          </p>
          <div className="flex w-full flex-col gap-sm sm:w-auto sm:flex-row">
            <ButtonLink href={ROUTES.tailor} variant="primary" className="h-11 w-full sm:w-auto">
              Tailor my resume
              <ArrowRight aria-hidden size={16} />
            </ButtonLink>
            <ButtonLink href="#how-it-works" className="h-11 w-full sm:w-auto">
              See how it works
            </ButtonLink>
          </div>
          <ul className="flex flex-col gap-xs text-body-sm text-ink-subtle sm:flex-row sm:flex-wrap sm:gap-x-lg">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-xs">
                <Check aria-hidden size={16} className="shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-xxl lg:mt-[72px]">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
