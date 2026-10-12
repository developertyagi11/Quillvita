import type { Metadata } from "next";

import { AppShell } from "@/components/features/layout/AppShell";
import { PageIntro } from "@/components/features/layout/PageIntro";
import { TailorWorkspace } from "@/components/features/TailorWorkspace";
import { ROUTES } from "@/lib/routes";
import { publicPageMetadata } from "@/lib/site";

export const metadata: Metadata = publicPageMetadata({
  path: ROUTES.tailor,
  title: "Tailor your resume to a job description · Quillvita",
  description:
    "Paste a job posting and upload your PDF or DOCX resume. Get a tailored version with a match score, ATS tips, missing keywords, a side-by-side diff and DOCX, PDF or TXT downloads. Free, no account needed.",
});

export default function TailorPage(): React.JSX.Element {
  return (
    <AppShell showHeaderCta={false}>
      <PageIntro />
      <TailorWorkspace />
    </AppShell>
  );
}
