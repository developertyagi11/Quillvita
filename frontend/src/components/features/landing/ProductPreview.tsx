import type { ReactNode } from "react";

import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { cn } from "@/lib/cn";

const TABS = [
  { label: "Tailored resume", short: "Resume" },
  { label: "Changes", short: "Changes" },
  { label: "Compare", short: "Compare" },
  { label: "Cover letter", short: "Letter" },
] as const;
const SKILLS = [
  { name: "React", matched: true },
  { name: "TypeScript", matched: true },
  { name: "Next.js", matched: true },
  { name: "Testing Library", matched: false },
  { name: "Figma", matched: false },
] as const;
const MISSING = [
  { keyword: "GraphQL", reason: "Listed as a requirement. Add it only if you've used it." },
  { keyword: "Storybook", reason: "A nice-to-have for the design system work." },
] as const;

function Reworded({ children }: { readonly children: ReactNode }): React.JSX.Element {
  return <mark className="rounded-xs bg-success/15 px-0.5 text-ink">{children}</mark>;
}

function PaneLabel({ children }: { readonly children: ReactNode }): React.JSX.Element {
  return <p className="text-eyebrow uppercase text-ink-tertiary">{children}</p>;
}

/** A static, illustrative rendering of the results screen with sample data. */
export function ProductPreview(): React.JSX.Element {
  return (
    <figure>
      <figcaption className="sr-only">
        Example result: a tailored resume with reworded phrases highlighted, a job match score of 86
        and an ATS score of 91, missing keywords with reasons, and an explained change.
      </figcaption>
      <div
        aria-hidden
        className="overflow-hidden rounded-xl border border-hairline bg-surface-1 shadow-edge"
      >
        <div className="flex items-center gap-sm border-b border-hairline px-md py-sm">
          <span className="flex shrink-0 gap-xxs">
            <span className="size-2.5 rounded-full bg-surface-4" />
            <span className="size-2.5 rounded-full bg-surface-4" />
            <span className="size-2.5 rounded-full bg-surface-4" />
          </span>
          <p className="min-w-0 truncate text-caption text-ink-subtle">
            Senior Frontend Engineer · Northwind Labs
          </p>
          <span className="ml-auto hidden shrink-0 gap-xxs sm:flex">
            <span className="rounded-sm bg-primary px-xs py-0.5 text-caption font-medium text-primary-foreground">
              PDF
            </span>
            <span className="rounded-sm border border-hairline px-xs py-0.5 text-caption text-ink-muted">
              DOCX
            </span>
            <span className="rounded-sm border border-hairline px-xs py-0.5 text-caption text-ink-muted">
              TXT
            </span>
          </span>
        </div>

        <div className="grid gap-md p-sm sm:p-lg lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
          <div className="min-w-0 overflow-hidden rounded-lg border border-hairline bg-canvas">
            <div className="flex gap-xxs overflow-hidden border-b border-hairline px-sm">
              {TABS.map((tab, index) => (
                <span
                  key={tab.label}
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-xxs border-b-2 px-xs text-caption sm:px-sm sm:text-body-sm",
                    index === 0 ? "border-primary text-ink" : "border-transparent text-ink-subtle",
                    index === TABS.length - 1 && "max-[359px]:hidden",
                  )}
                >
                  <span className="sm:hidden">{tab.short}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  {index === 1 ? (
                    <span className="rounded-pill bg-surface-3 px-xs text-caption">4</span>
                  ) : null}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-md p-md sm:gap-lg sm:p-lg">
              <div>
                <p className="font-display text-body-lg font-medium text-ink sm:text-card-title">
                  Alex Morgan
                </p>
                <p className="text-caption text-ink-subtle sm:text-body-sm">
                  alex@example.com · Berlin · github.com/alexmorgan
                </p>
              </div>

              <div className="flex flex-col gap-xs border-t border-hairline pt-md">
                <PaneLabel>Summary</PaneLabel>
                <p className="text-body-sm text-ink-muted">
                  Frontend engineer with 6 years of <Reworded>React and TypeScript</Reworded>{" "}
                  experience. Led the <Reworded>design system</Reworded> used by 4 product teams and{" "}
                  <Reworded>cut page load time by 35%</Reworded>.
                </p>
              </div>

              <div className="flex flex-col gap-xs border-t border-hairline pt-md">
                <PaneLabel>Skills</PaneLabel>
                <div className="flex flex-wrap gap-xs">
                  {SKILLS.map((skill) => (
                    <Badge key={skill.name} tone={skill.matched ? "accent" : "neutral"}>
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-xs border-t border-hairline pt-md">
                <PaneLabel>Experience</PaneLabel>
                <div className="flex flex-wrap items-baseline justify-between gap-x-sm">
                  <p className="text-body-sm font-medium text-ink">
                    Frontend Engineer <span className="text-ink-subtle">· Brightside</span>
                  </p>
                  <p className="text-caption text-ink-tertiary">2021 – Present</p>
                </div>
                <ul className="flex list-disc flex-col gap-xxs pl-md text-body-sm text-ink-muted marker:text-ink-tertiary">
                  <li>
                    Rebuilt checkout in <Reworded>React and TypeScript</Reworded>, cutting page load
                    time by 35%
                  </li>
                  <li>
                    Led a <Reworded>design system</Reworded> of 60+ components adopted by 4 product
                    teams
                  </li>
                  <li className="hidden sm:list-item">
                    Mentored 3 engineers through code reviews and pairing
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-md sm:grid-cols-2 lg:grid-cols-1 lg:content-start">
            <div className="rounded-lg border border-hairline bg-canvas p-md">
              <PaneLabel>Scores</PaneLabel>
              <div className="mt-sm flex items-center justify-around gap-md">
                <div className="flex flex-col items-center gap-xxs">
                  <ScoreRing value={86} label="Job match" size={72} />
                  <span className="text-caption text-ink-subtle">Job match</span>
                </div>
                <div className="flex flex-col items-center gap-xxs">
                  <ScoreRing value={91} label="ATS readiness" size={72} />
                  <span className="text-caption text-ink-subtle">ATS readiness</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-hairline bg-canvas p-md">
              <PaneLabel>Missing keywords</PaneLabel>
              <ul className="mt-sm flex flex-col gap-sm">
                {MISSING.map((item) => (
                  <li key={item.keyword} className="flex flex-col gap-xxs">
                    <Badge tone="warning" className="self-start">
                      {item.keyword}
                    </Badge>
                    <span className="text-caption text-ink-subtle">{item.reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden rounded-lg border border-hairline bg-canvas p-md sm:col-span-2 sm:block lg:col-span-1">
              <PaneLabel>Change · Experience</PaneLabel>
              <p className="mt-sm text-caption text-ink-tertiary line-through">
                Rebuilt the checkout page, which loaded 35% faster
              </p>
              <p className="mt-xxs text-caption text-ink">
                Rebuilt checkout in React and TypeScript, cutting page load time by 35%
              </p>
              <p className="mt-xs text-caption text-ink-subtle">
                Leads with the posting&apos;s core stack and a result you already had.
              </p>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
