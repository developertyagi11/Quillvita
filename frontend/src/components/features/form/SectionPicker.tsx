import { Checkbox } from "@/components/ui/Checkbox";
import { SECTION_NAMES } from "@/schemas/resume";
import type { SectionName } from "@/types/resume";

interface SectionPickerProps {
  readonly selected: readonly SectionName[];
  readonly error: string | null;
  readonly onToggle: (section: SectionName, enabled: boolean) => void;
}

export const SECTION_LABELS: Readonly<Record<SectionName, string>> = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
};

export function SectionPicker({
  selected,
  error,
  onToggle,
}: SectionPickerProps): React.JSX.Element {
  return (
    <fieldset className="flex flex-col gap-xs">
      <legend className="text-body-sm font-medium text-ink">Sections to tailor</legend>
      <p className="text-caption text-ink-subtle">
        Unselected sections are kept exactly as written. Contact details and education never change.
      </p>
      <div className="mt-xxs grid grid-cols-2 gap-xs">
        {SECTION_NAMES.map((section) => (
          <Checkbox
            key={section}
            label={SECTION_LABELS[section]}
            checked={selected.includes(section)}
            onCheckedChange={(checked) => onToggle(section, checked)}
          />
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-caption text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
