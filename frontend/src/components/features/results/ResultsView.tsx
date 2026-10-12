"use client";

import { useState } from "react";

import { ChangesList } from "@/components/features/results/ChangesList";
import { CoverLetterPanel } from "@/components/features/results/cover-letter/CoverLetterPanel";
import { DiffView } from "@/components/features/results/diff/DiffView";
import { ExportToolbar } from "@/components/features/results/ExportToolbar";
import { ScoreCard } from "@/components/features/results/insights/ScoreCard";
import {
  MatchedSkillsCard,
  MissingKeywordsCard,
} from "@/components/features/results/insights/SkillsInsights";
import { ResumePreview } from "@/components/features/results/preview/ResumePreview";
import { Card } from "@/components/ui/Card";
import { panelId, TabList, tabId } from "@/components/ui/Tabs";
import type { TabItem } from "@/components/ui/Tabs";
import type { CustomizeResponse } from "@/types/api";

type ResultTab = "resume" | "changes" | "compare" | "cover-letter";

interface ResultsViewProps {
  readonly result: CustomizeResponse;
  readonly jobDescription: string;
  readonly onEdit: () => void;
}

const TABS_ID = "results";

export function ResultsView({
  result,
  jobDescription,
  onEdit,
}: ResultsViewProps): React.JSX.Element {
  const [tab, setTab] = useState<ResultTab>("resume");
  const tabs: readonly TabItem<ResultTab>[] = [
    { id: "resume", label: "Tailored resume", shortLabel: "Resume" },
    { id: "changes", label: "Changes", count: result.changes.length },
    { id: "compare", label: "Compare" },
    { id: "cover-letter", label: "Cover letter", shortLabel: "Letter" },
  ];

  return (
    <section aria-label="Results" className="flex flex-col gap-lg">
      <ExportToolbar resume={result.tailored} onEdit={onEdit} />
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
              <ResumePreview resume={result.tailored} highlightedSkills={result.matched_skills} />
            ) : null}
            {tab === "changes" ? <ChangesList changes={result.changes} /> : null}
            {tab === "compare" ? (
              <DiffView
                original={result.original}
                tailored={result.tailored}
                sections={result.sections}
              />
            ) : null}
            {tab === "cover-letter" ? (
              <CoverLetterPanel resume={result.tailored} jobDescription={jobDescription} />
            ) : null}
          </div>
        </Card>
        <aside aria-label="Match insights" className="flex flex-col gap-lg">
          <ScoreCard scores={result.scores} />
          <MatchedSkillsCard skills={result.matched_skills} />
          <MissingKeywordsCard keywords={result.suggested_keywords} />
        </aside>
      </div>
    </section>
  );
}
