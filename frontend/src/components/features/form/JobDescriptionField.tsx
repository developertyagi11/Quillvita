import { MAX_JD_LENGTH, MIN_JD_LENGTH } from "@/lib/constants";
import { cn } from "@/lib/cn";

interface JobDescriptionFieldProps {
  readonly value: string;
  readonly error: string | null;
  readonly onChange: (value: string) => void;
  readonly onBlur: () => void;
}

const FIELD_ID = "job-description";
const HINT_ID = `${FIELD_ID}-hint`;
const ERROR_ID = `${FIELD_ID}-error`;

export function JobDescriptionField({
  value,
  error,
  onChange,
  onBlur,
}: JobDescriptionFieldProps): React.JSX.Element {
  const length = value.trim().length;
  const meetsMinimum = length >= MIN_JD_LENGTH;
  const describedBy = error ? `${HINT_ID} ${ERROR_ID}` : HINT_ID;

  return (
    <div className="flex h-full flex-col gap-xs">
      <label htmlFor={FIELD_ID} className="text-body-sm font-medium text-ink">
        Job description
      </label>
      <textarea
        id={FIELD_ID}
        name="job_description"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        maxLength={MAX_JD_LENGTH}
        aria-invalid={error !== null}
        aria-describedby={describedBy}
        placeholder="Paste the full posting: responsibilities, requirements, and nice-to-haves."
        className={cn(
          "min-h-72 w-full flex-1 resize-y rounded-md border bg-canvas px-sm py-xs text-body-sm text-ink",
          "placeholder:text-ink-tertiary transition-colors duration-fast ease-standard",
          "focus-visible:border-hairline-strong lg:min-h-96",
          error ? "border-danger/60" : "border-hairline",
        )}
      />
      <div className="flex items-start justify-between gap-sm text-caption">
        <p id={HINT_ID} className="text-ink-subtle">
          Minimum {MIN_JD_LENGTH} characters. Instructions inside the text are ignored.
        </p>
        <p
          aria-live="polite"
          className={cn(
            "shrink-0 tabular-nums",
            meetsMinimum ? "text-ink-subtle" : "text-ink-tertiary",
          )}
        >
          {length.toLocaleString()} / {MIN_JD_LENGTH}+
        </p>
      </div>
      {error ? (
        <p id={ERROR_ID} role="alert" className="text-caption text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
