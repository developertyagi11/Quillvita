"use client";

import { ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ScoreBadges } from "@/components/features/history/ScoreBadges";
import { ResultsView } from "@/components/features/results/ResultsView";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { downloadOriginalResume, useHistoryEntry } from "@/hooks/useHistory";
import { useToast } from "@/hooks/useToast";
import { toErrorMessage } from "@/lib/api-error";
import { formatDateTime, joinPresent } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

interface HistoryEntryViewProps {
  readonly id: string;
}

export function HistoryEntryView({ id }: HistoryEntryViewProps): React.JSX.Element {
  const state = useHistoryEntry(id);
  const router = useRouter();
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  async function downloadOriginal(): Promise<void> {
    setIsDownloading(true);
    try {
      await downloadOriginalResume(id);
    } catch (error) {
      toast.show({ tone: "danger", title: toErrorMessage(error) });
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-lg">
      <ButtonLink
        href="/history"
        size="sm"
        variant="tertiary"
        icon={ArrowLeft}
        className="self-start"
      >
        All saved resumes
      </ButtonLink>

      {state.status === "loading" ? (
        <div aria-busy className="flex flex-col gap-sm">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-md h-96 w-full" />
        </div>
      ) : null}

      {state.status === "error" ? (
        <Alert tone="danger" title="We couldn't open this saved resume">
          {state.message}
        </Alert>
      ) : null}

      {state.status === "success" ? (
        <>
          <div className="flex flex-col gap-sm sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-card-title text-ink">{state.data.job_title}</h1>
              <p className="mt-xxs text-body-sm text-ink-subtle">
                {joinPresent([state.data.file_name, formatDateTime(state.data.created_at)])}
              </p>
              <div className="mt-xs">
                <ScoreBadges matchScore={state.data.match_score} atsScore={state.data.ats_score} />
              </div>
            </div>
            <Button
              size="sm"
              icon={Download}
              isLoading={isDownloading}
              onClick={() => void downloadOriginal()}
            >
              Download original
            </Button>
          </div>
          <ResultsView
            result={state.data.result}
            jobDescription={state.data.job_description}
            onEdit={() => router.push(ROUTES.tailor)}
          />
        </>
      ) : null}
    </div>
  );
}
