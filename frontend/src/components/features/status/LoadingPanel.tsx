"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { useProgressSteps } from "@/hooks/useProgressSteps";
import { cn } from "@/lib/cn";

const STEPS = [
  "Reading your resume",
  "Analyzing the job description",
  "Tailoring the selected sections",
  "Scoring the match and checking ATS fit",
] as const;
const SECONDS_PER_STEP = 6;
const SLOW_REQUEST_SECONDS = 25;

interface LoadingPanelProps {
  readonly onCancel: () => void;
}

export function LoadingPanel({ onCancel }: LoadingPanelProps): React.JSX.Element {
  const { activeIndex, elapsedSeconds } = useProgressSteps(STEPS.length, SECONDS_PER_STEP);

  return (
    <Card
      aria-labelledby="loading-heading"
      className="grid gap-xl p-lg lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
    >
      <div className="flex flex-col gap-md">
        <div>
          <h2 id="loading-heading" className="text-card-title text-ink">
            Tailoring your resume
          </h2>
          <p className="mt-xxs text-body-sm text-ink-subtle">
            This usually takes 15 to 40 seconds.
          </p>
        </div>
        <ol aria-live="polite" className="flex flex-col gap-sm">
          {STEPS.map((step, index) => {
            const isDone = index < activeIndex;
            const isActive = index === activeIndex;
            return (
              <li key={step} className="flex items-center gap-sm text-body-sm">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full border",
                    isDone ? "border-success/40 text-success" : "border-hairline text-ink-subtle",
                  )}
                >
                  {isDone ? (
                    <Check aria-hidden size={14} />
                  ) : isActive ? (
                    <Spinner size={14} />
                  ) : null}
                </span>
                <span className={isDone || isActive ? "text-ink" : "text-ink-tertiary"}>
                  {step}
                  {isActive ? <span className="sr-only"> (in progress)</span> : null}
                </span>
              </li>
            );
          })}
        </ol>
        {elapsedSeconds >= SLOW_REQUEST_SECONDS ? (
          <p className="text-caption text-ink-subtle">
            Still working. The first request after a quiet period can take up to a minute while the
            server wakes up.
          </p>
        ) : null}
        <div>
          <Button variant="tertiary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
      <div
        aria-hidden
        className="hidden flex-col gap-sm rounded-md border border-hairline bg-canvas p-lg sm:flex"
      >
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="mt-md h-3 w-1/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="mt-md h-3 w-1/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-10/12" />
        <Skeleton className="h-3 w-9/12" />
      </div>
    </Card>
  );
}
