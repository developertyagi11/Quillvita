"use client";

import { useCallback, useState } from "react";

import { useToast } from "@/hooks/useToast";
import { exportResume } from "@/lib/api-client";
import { toErrorMessage } from "@/lib/api-error";
import { saveBlob } from "@/lib/download";
import type { ExportFormat, ResumeContent } from "@/types/resume";

export interface ResumeExporter {
  readonly pendingFormat: ExportFormat | null;
  readonly download: (format: ExportFormat) => Promise<void>;
}

export function useExportResume(resume: ResumeContent): ResumeExporter {
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(null);
  const { show } = useToast();

  const download = useCallback(
    async (format: ExportFormat) => {
      setPendingFormat(format);
      try {
        const { blob, filename } = await exportResume(resume, format);
        saveBlob(blob, filename);
        show({ tone: "success", title: "Download started", description: filename });
      } catch (error) {
        show({ tone: "danger", title: "Download failed", description: toErrorMessage(error) });
      } finally {
        setPendingFormat(null);
      }
    },
    [resume, show],
  );

  return { pendingFormat, download };
}
