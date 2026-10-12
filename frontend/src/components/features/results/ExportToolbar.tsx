"use client";

import { Check, Copy, Download, PencilLine } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useExportResume } from "@/hooks/useExportResume";
import { resumeToPlainText } from "@/lib/resume-text";
import type { ExportFormat, ResumeContent } from "@/types/resume";

interface ExportToolbarProps {
  readonly resume: ResumeContent;
  readonly onEdit: () => void;
}

const FORMATS: readonly { readonly format: ExportFormat; readonly label: string }[] = [
  { format: "pdf", label: "PDF" },
  { format: "docx", label: "DOCX" },
  { format: "txt", label: "TXT" },
];

export function ExportToolbar({ resume, onEdit }: ExportToolbarProps): React.JSX.Element {
  const { pendingFormat, download } = useExportResume(resume);
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-card-title text-ink">Your tailored resume</h2>
        <p className="mt-xxs text-body-sm text-ink-subtle">
          Review it, undo any change or edit a line, then download or copy.
        </p>
      </div>
      <div
        role="group"
        aria-label="Download and copy"
        className="flex flex-wrap items-center gap-xs"
      >
        {FORMATS.map(({ format, label }) => (
          <Button
            key={format}
            size="sm"
            variant={format === "pdf" ? "primary" : "secondary"}
            icon={Download}
            isLoading={pendingFormat === format}
            disabled={pendingFormat !== null && pendingFormat !== format}
            onClick={() => void download(format)}
            aria-label={`Download as ${label}`}
          >
            {label}
          </Button>
        ))}
        <Button
          size="sm"
          icon={copied ? Check : Copy}
          onClick={() => void copy(resumeToPlainText(resume))}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button size="sm" variant="tertiary" icon={PencilLine} onClick={onEdit}>
          Change inputs
        </Button>
      </div>
    </div>
  );
}
