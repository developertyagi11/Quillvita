"use client";

import { Download, FileText, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ScoreBadges } from "@/components/features/history/ScoreBadges";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { downloadOriginalResume, useHistoryList } from "@/hooks/useHistory";
import { useToast } from "@/hooks/useToast";
import { toErrorMessage } from "@/lib/api-error";
import { formatDateTime, joinPresent } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import type { HistorySummary } from "@/types/api";

const SKELETON_ROWS = 3;

interface HistoryRowProps {
  readonly item: HistorySummary;
  readonly onDelete: (item: HistorySummary) => Promise<void>;
}

function HistoryRow({ item, onDelete }: HistoryRowProps): React.JSX.Element {
  const toast = useToast();
  const [pending, setPending] = useState<"download" | "delete" | null>(null);

  async function run(action: "download" | "delete"): Promise<void> {
    setPending(action);
    try {
      if (action === "download") {
        await downloadOriginalResume(item.id);
      } else {
        await onDelete(item);
      }
    } catch (error) {
      toast.show({ tone: "danger", title: toErrorMessage(error) });
    } finally {
      setPending(null);
    }
  }

  return (
    <li className="flex flex-col gap-sm px-lg py-md sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Link
          href={`/history/${item.id}`}
          className="block truncate text-body font-medium text-ink underline-offset-4 hover:underline"
        >
          {item.job_title}
        </Link>
        <p className="mt-xxs flex items-center gap-xxs text-body-sm text-ink-subtle">
          <FileText aria-hidden size={14} className="shrink-0" />
          <span className="truncate">
            {joinPresent([item.file_name, formatDateTime(item.created_at)])}
          </span>
        </p>
        <div className="mt-xs">
          <ScoreBadges matchScore={item.match_score} atsScore={item.ats_score} />
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-xs">
        <ButtonLink href={`/history/${item.id}`} size="sm" variant="primary">
          Open
        </ButtonLink>
        <Button
          size="sm"
          icon={Download}
          isLoading={pending === "download"}
          disabled={pending !== null}
          onClick={() => void run("download")}
          aria-label={`Download original file ${item.file_name}`}
        >
          Original
        </Button>
        <Button
          size="sm"
          variant="tertiary"
          icon={Trash2}
          isLoading={pending === "delete"}
          disabled={pending !== null}
          onClick={() => void run("delete")}
          aria-label={`Delete ${item.job_title}`}
        >
          Delete
        </Button>
      </div>
    </li>
  );
}

export function HistoryList(): React.JSX.Element {
  const { state, remove } = useHistoryList();
  const toast = useToast();

  async function handleDelete(item: HistorySummary): Promise<void> {
    if (
      !window.confirm(`Delete "${item.job_title}" and its uploaded file? This can't be undone.`)
    ) {
      return;
    }
    await remove(item.id);
    toast.show({ tone: "success", title: "Deleted from your history" });
  }

  return (
    <Card>
      <CardHeader
        title="Your saved resumes"
        description="Every resume you tailor while signed in is saved here with its results."
        actions={
          <ButtonLink href={ROUTES.tailor} size="sm" icon={Plus}>
            Tailor a resume
          </ButtonLink>
        }
      />
      {state.status === "loading" ? (
        <ul aria-busy className="divide-y divide-hairline">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <li key={index} className="flex flex-col gap-xs px-lg py-md">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </li>
          ))}
        </ul>
      ) : null}
      {state.status === "error" ? (
        <div className="p-lg">
          <Alert tone="danger" title="We couldn't load your history">
            {state.message}
          </Alert>
        </div>
      ) : null}
      {state.status === "success" && state.data.length === 0 ? (
        <p className="px-lg py-xl text-center text-body-sm text-ink-subtle">
          Nothing saved yet. Tailor a resume while signed in and it will show up here.
        </p>
      ) : null}
      {state.status === "success" && state.data.length > 0 ? (
        <ul className="divide-y divide-hairline">
          {state.data.map((item) => (
            <HistoryRow key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
