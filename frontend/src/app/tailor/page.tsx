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
    "Paste a job post and upload your resume. Get a tailored version with a match score, ATS tips, missing keywords and DOCX, PDF or TXT downloads. Free.",
});

export default function TailorPage(): React.JSX.Element {
  return (
    <AppShell showHeaderCta={false}>
      <PageIntro />
      <TailorWorkspace />
    </AppShell>
  );
}
