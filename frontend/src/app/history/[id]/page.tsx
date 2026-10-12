import type { Metadata } from "next";
import { Suspense } from "react";

import { HistoryEntryView } from "@/components/features/history/HistoryEntryView";
import { AppShell } from "@/components/features/layout/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { NO_INDEX } from "@/lib/site";

export const metadata: Metadata = { title: "Saved resume", robots: NO_INDEX };

type Params = Promise<{ id: string }>;

async function EntryFromParams({
  params,
}: {
  readonly params: Params;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  return <HistoryEntryView id={id} />;
}

interface HistoryEntryPageProps {
  readonly params: Params;
}

export default function HistoryEntryPage({ params }: HistoryEntryPageProps): React.JSX.Element {
  return (
    <AppShell>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <EntryFromParams params={params} />
      </Suspense>
    </AppShell>
  );
}
