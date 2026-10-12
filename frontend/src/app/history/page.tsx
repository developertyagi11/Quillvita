import type { Metadata } from "next";

import { HistoryList } from "@/components/features/history/HistoryList";
import { AppShell } from "@/components/features/layout/AppShell";
import { NO_INDEX } from "@/lib/site";

export const metadata: Metadata = { title: "History", robots: NO_INDEX };

export default function HistoryPage(): React.JSX.Element {
  return (
    <AppShell>
      <HistoryList />
    </AppShell>
  );
}
