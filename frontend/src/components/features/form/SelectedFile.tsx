import { FileText, X } from "lucide-react";

import { formatBytes } from "@/lib/format";

interface SelectedFileProps {
  readonly file: File;
  readonly onRemove: () => void;
}

export function SelectedFile({ file, onRemove }: SelectedFileProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-sm rounded-md border border-hairline-strong bg-surface-2 px-sm py-sm">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-3 text-ink-muted">
        <FileText aria-hidden size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-sm font-medium text-ink" title={file.name}>
          {file.name}
        </p>
        <p className="text-caption text-ink-subtle">{formatBytes(file.size)}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="flex size-9 items-center justify-center rounded-md text-ink-subtle transition-colors duration-fast hover:bg-surface-3 hover:text-ink"
      >
        <X aria-hidden size={16} />
      </button>
    </div>
  );
}
