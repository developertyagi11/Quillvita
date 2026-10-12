import { Sparkles } from "lucide-react";

import { JobDescriptionField } from "@/components/features/form/JobDescriptionField";
import { ResumeDropzone } from "@/components/features/form/ResumeDropzone";
import { SectionPicker } from "@/components/features/form/SectionPicker";
import { StorageNotice } from "@/components/features/form/StorageNotice";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { CustomizeForm } from "@/hooks/useCustomizeForm";

interface CustomizeFormViewProps {
  readonly form: CustomizeForm;
}

export function CustomizeFormView({ form }: CustomizeFormViewProps): React.JSX.Element {
  return (
    <Card as="section" aria-labelledby="customize-heading">
      <form
        noValidate
        onSubmit={form.handleSubmit}
        className="grid gap-lg p-md sm:p-lg lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
      >
        <h2 id="customize-heading" className="sr-only">
          Tailor your resume
        </h2>
        <JobDescriptionField
          value={form.jobDescription}
          error={form.jobDescriptionError}
          onChange={form.setJobDescription}
          onBlur={form.markJobDescriptionTouched}
        />
        <div className="flex flex-col gap-lg">
          <ResumeDropzone upload={form.upload} error={form.fileError} />
          <SectionPicker
            selected={form.sections}
            error={form.sectionsError}
            onToggle={form.toggleSection}
          />
          <div className="mt-auto flex flex-col gap-xs border-t border-hairline pt-lg">
            <Button
              type="submit"
              variant="primary"
              icon={Sparkles}
              disabled={form.upload.isValidating}
              className="w-full"
            >
              Tailor resume
            </Button>
            <StorageNotice />
          </div>
        </div>
      </form>
    </Card>
  );
}
