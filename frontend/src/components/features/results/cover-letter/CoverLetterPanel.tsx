"use client";

import { Check, Copy, Download, PenLine, RotateCcw } from "lucide-react";

import { CoverLetterBody } from "@/components/features/results/cover-letter/CoverLetterBody";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useCoverLetter } from "@/hooks/useCoverLetter";
import { saveTextFile } from "@/lib/download";
import { coverLetterFilename, coverLetterToPlainText } from "@/lib/resume-text";
import type { CoverLetterTone } from "@/types/api";
import type { ResumeContent } from "@/types/resume";

interface CoverLetterPanelProps {
  readonly resume: ResumeContent;
  readonly jobDescription: string;
}

const TONE_OPTIONS: readonly { readonly value: CoverLetterTone; readonly label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "concise", label: "Concise" },
];

export function CoverLetterPanel({
  resume,
  jobDescription,
}: CoverLetterPanelProps): React.JSX.Element {
  const { state, tone, setTone, generate } = useCoverLetter(resume, jobDescription);
  const { copied, copy } = useCopyToClipboard();
  const isLoading = state.status === "loading";

  return (
    <div className="flex flex-col gap-lg p-lg">
      <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          label="Tone"
          options={TONE_OPTIONS}
          value={tone}
          onChange={setTone}
          disabled={isLoading}
        />
        <Button
          variant={state.status === "success" ? "secondary" : "primary"}
          icon={state.status === "success" ? RotateCcw : PenLine}
          isLoading={isLoading}
          onClick={() => void generate()}
        >
          {state.status === "success" ? "Regenerate" : "Write cover letter"}
        </Button>
      </div>

      {state.status === "idle" ? (
        <p className="rounded-md border border-dashed border-hairline-strong p-lg text-center text-body-sm text-ink-subtle">
          Generate a cover letter built from your tailored resume and this job description. It uses
          only facts from your resume.
        </p>
      ) : null}

      {state.status === "loading" ? (
        <div
          aria-busy
          className="flex flex-col gap-sm rounded-md border border-hairline bg-canvas p-lg"
        >
          <span className="sr-only" role="status">
            Writing your cover letter
          </span>
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ) : null}

      {state.status === "error" ? (
        <Alert tone="danger" title="Couldn't write the cover letter">
          {state.message}
        </Alert>
      ) : null}

      {state.status === "success" ? (
        <div className="flex flex-col gap-md">
          <CoverLetterBody letter={state.data} />
          <div className="flex flex-wrap gap-xs">
            <Button
              size="sm"
              icon={copied ? Check : Copy}
              onClick={() => void copy(coverLetterToPlainText(state.data))}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              size="sm"
              icon={Download}
              onClick={() =>
                saveTextFile(coverLetterToPlainText(state.data), coverLetterFilename(resume.name))
              }
            >
              Download TXT
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
