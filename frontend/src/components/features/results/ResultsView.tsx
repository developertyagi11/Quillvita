"use client";

import { Check, PencilLine, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { ChangesList } from "@/components/features/results/ChangesList";
import { CoverLetterPanel } from "@/components/features/results/cover-letter/CoverLetterPanel";
import { DiffView } from "@/components/features/results/diff/DiffView";
import { ResumeEditor } from "@/components/features/results/editor/ResumeEditor";
import { ExportToolbar } from "@/components/features/results/ExportToolbar";
import { ScoreCard } from "@/components/features/results/insights/ScoreCard";
import {
  MatchedSkillsCard,
  MissingKeywordsCard,
} from "@/components/features/results/insights/SkillsInsights";
import { ResumePreview } from "@/components/features/results/preview/ResumePreview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { panelId, TabList, tabId } from "@/components/ui/Tabs";
import type { TabItem } from "@/components/ui/Tabs";
import { useCoverLetter } from "@/hooks/useCoverLetter";
import { useResumeDraft } from "@/hooks/useResumeDraft";
import { locateChanges } from "@/lib/resume-edit";
import type { CoverLetter, CustomizeResponse } from "@/types/api";

type ResultTab = "resume" | "changes" | "compare" | "cover-letter";

interface ResultsViewProps {
  readonly result: CustomizeResponse;
  readonly jobDescription: string;
  readonly onEdit: () => void;
  readonly historyId?: string | null;
  readonly savedCoverLetter?: CoverLetter | null;
  /** Re-tailors with skills the user confirms they have; omitted when the original file isn't available. */
  readonly onAddSkills?: (skills: readonly string[]) => void;
}

const TABS_ID = "results";

export function ResultsView({
  result,
  jobDescription,
  onEdit,
  historyId = null,
  savedCoverLetter = null,
  onAddSkills,
}: ResultsViewProps): React.JSX.Element {
  const [tab, setTab] = useState<ResultTab>("resume");
  const [isEditing, setIsEditing] = useState(false);
  const draft = useResumeDraft(result.tailored);
  const targets = useMemo(
    () => locateChanges(result.tailored, result.changes),
    [result.tailored, result.changes],
  );
  const coverLetter = useCoverLetter(draft.resume, jobDescription, {
    historyId,
    saved: savedCoverLetter,
  });
  const tabs: readonly TabItem<ResultTab>[] = [
    { id: "resume", label: "Tailored resume", shortLabel: "Resume" },
    { id: "changes", label: "Changes", count: result.changes.length },
    { id: "compare", label: "Compare" },
    { id: "cover-letter", label: "Cover letter", shortLabel: "Letter" },
  ];

  return (
    <section aria-label="Results" className="flex flex-col gap-lg">
      <ExportToolbar resume={draft.resume} onEdit={onEdit} />
      <div className="grid items-start gap-lg lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <Card as="div" className="min-w-0 overflow-hidden">
          <TabList
            items={tabs}
            selected={tab}
            onSelect={setTab}
            label="Result views"
            idPrefix={TABS_ID}
          />
          <div
            role="tabpanel"
            id={panelId(TABS_ID, tab)}
            aria-labelledby={tabId(TABS_ID, tab)}
            tabIndex={0}
          >
            {tab === "resume" ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-sm border-b border-hairline px-lg py-sm">
                  <p className="text-caption text-ink-subtle">
                    {isEditing
                      ? "Changes apply to downloads right away. They're kept until you leave this page."
                      : draft.isEdited
                        ? "Showing your edited version."
                        : "Want to tweak something? Edit any line before you download."}
                  </p>
                  <div className="flex gap-xs">
                    {draft.isEdited ? (
                      <Button size="sm" variant="tertiary" icon={RotateCcw} onClick={draft.reset}>
                        Reset all edits
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant={isEditing ? "primary" : "secondary"}
                      icon={isEditing ? Check : PencilLine}
                      onClick={() => setIsEditing((value) => !value)}
                    >
                      {isEditing ? "Done" : "Edit resume"}
                    </Button>
                  </div>
                </div>
                {isEditing ? (
                  <ResumeEditor key={draft.revision} resume={draft.draft} onEdit={draft.edit} />
                ) : (
                  <ResumePreview resume={draft.resume} highlightedSkills={result.matched_skills} />
                )}
              </>
            ) : null}
            {tab === "changes" ? (
              <ChangesList
                changes={result.changes}
                targets={targets}
                resume={draft.draft}
                onChoose={draft.choose}
              />
            ) : null}
            {tab === "compare" ? (
              <DiffView
                original={result.original}
                tailored={draft.resume}
                sections={result.sections}
              />
            ) : null}
            {tab === "cover-letter" ? (
              <CoverLetterPanel candidateName={draft.resume.name} generator={coverLetter} />
            ) : null}
          </div>
        </Card>
        <aside aria-label="Match insights" className="flex flex-col gap-lg">
          <ScoreCard scores={result.scores} />
          <MatchedSkillsCard skills={result.matched_skills} />
          <MissingKeywordsCard
            keywords={result.suggested_keywords}
            {...(onAddSkills ? { onAddSkills } : {})}
          />
        </aside>
      </div>
    </section>
  );
}
