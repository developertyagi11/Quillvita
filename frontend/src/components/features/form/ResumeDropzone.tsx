"use client";

import { Upload } from "lucide-react";

import { SelectedFile } from "@/components/features/form/SelectedFile";
import { Spinner } from "@/components/ui/Spinner";
import type { FileUpload } from "@/hooks/useFileUpload";
import { ACCEPT_ATTRIBUTE, MAX_FILE_SIZE_MB } from "@/lib/constants";
import { cn } from "@/lib/cn";

interface ResumeDropzoneProps {
  readonly upload: FileUpload;
  readonly error: string | null;
}

const INPUT_ID = "resume-file";
const LABEL_ID = `${INPUT_ID}-label`;
const HINT_ID = `${INPUT_ID}-hint`;
const ERROR_ID = `${INPUT_ID}-error`;

export function ResumeDropzone({ upload, error }: ResumeDropzoneProps): React.JSX.Element {
  const { file, isDragging, isValidating, dropHandlers } = upload;

  return (
    <div className="flex flex-col gap-xs">
      <span id={LABEL_ID} className="text-body-sm font-medium text-ink">
        Resume
      </span>
      {file ? (
        <SelectedFile file={file} onRemove={upload.clear} />
      ) : (
        <label
          htmlFor={INPUT_ID}
          {...dropHandlers}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-xs rounded-md border border-dashed px-md py-xl text-center",
            "transition-colors duration-fast ease-standard has-[:focus-visible]:shadow-focus",
            isDragging ? "border-primary bg-surface-2" : "bg-canvas hover:bg-surface-2",
            !isDragging && (error ? "border-danger/60" : "border-hairline-strong"),
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-md border border-hairline bg-surface-2 text-ink-subtle">
            {isValidating ? <Spinner size={18} /> : <Upload aria-hidden size={18} />}
          </span>
          <span className="text-body-sm text-ink">
            <span className="font-medium text-primary-hover">Choose a file</span> or drag it here
          </span>
          <span id={HINT_ID} className="text-caption text-ink-subtle">
            PDF or DOCX, up to {MAX_FILE_SIZE_MB} MB
          </span>
          <input
            id={INPUT_ID}
            type="file"
            accept={ACCEPT_ATTRIBUTE}
            aria-labelledby={LABEL_ID}
            aria-invalid={error !== null}
            aria-describedby={error ? `${HINT_ID} ${ERROR_ID}` : HINT_ID}
            className="sr-only"
            onChange={(event) => {
              void upload.selectFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
      )}
      {error ? (
        <p id={ERROR_ID} role="alert" className="text-caption text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
