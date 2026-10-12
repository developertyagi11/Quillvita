"use client";

import { Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { splitList } from "@/lib/resume-edit";

const CONTROL_CLASSES = cn(
  "w-full rounded-md border border-hairline bg-canvas px-sm text-body-sm text-ink",
  "placeholder:text-ink-tertiary transition-colors duration-fast ease-standard",
  "focus-visible:border-hairline-strong",
);
const TEXTAREA_CLASSES = cn(CONTROL_CLASSES, "field-sizing-content min-h-16 resize-y py-xs");
const LABEL_CLASSES = "text-caption font-medium text-ink-subtle";

interface TextFieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly multiline?: boolean;
  readonly className?: string;
}

export function TextField({
  label,
  value,
  onChange,
  multiline = false,
  className,
}: TextFieldProps): React.JSX.Element {
  const id = useId();
  return (
    <div className={cn("flex min-w-0 flex-col gap-xxs", className)}>
      <label htmlFor={id} className={LABEL_CLASSES}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={TEXTAREA_CLASSES}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(CONTROL_CLASSES, "h-9")}
        />
      )}
    </div>
  );
}

interface ListFieldProps {
  readonly label: string;
  readonly items: readonly string[];
  readonly onChange: (items: string[]) => void;
  readonly hint?: string;
}

/** A comma-separated list. The typed text is kept as-is so trailing commas don't vanish mid-edit. */
export function ListField({ label, items, onChange, hint }: ListFieldProps): React.JSX.Element {
  const id = useId();
  const [text, setText] = useState(() => items.join(", "));
  return (
    <div className="flex min-w-0 flex-col gap-xxs">
      <label htmlFor={id} className={LABEL_CLASSES}>
        {label}
      </label>
      <textarea
        id={id}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          onChange(splitList(event.target.value));
        }}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={TEXTAREA_CLASSES}
      />
      {hint ? (
        <p id={`${id}-hint`} className="text-caption text-ink-tertiary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface LinesFieldProps {
  readonly label: string;
  /** Names the entry in screen-reader labels, e.g. "Engineer at Acme". */
  readonly context: string;
  readonly lines: readonly string[];
  readonly onChange: (lines: string[]) => void;
  readonly addLabel: string;
}

/** Bullet points: one text box per line, each removable, plus one to add a line. */
export function LinesField({
  label,
  context,
  lines,
  onChange,
  addLabel,
}: LinesFieldProps): React.JSX.Element {
  return (
    <fieldset className="flex min-w-0 flex-col gap-xs">
      <legend className={cn(LABEL_CLASSES, "mb-xxs")}>{label}</legend>
      {lines.map((line, index) => (
        <div key={index} className="flex items-start gap-xs">
          <textarea
            value={line}
            onChange={(event) =>
              onChange(lines.map((item, at) => (at === index ? event.target.value : item)))
            }
            aria-label={`${label} ${index + 1} for ${context}`}
            className={TEXTAREA_CLASSES}
          />
          <Button
            size="sm"
            variant="tertiary"
            icon={Trash2}
            onClick={() => onChange(lines.filter((_, at) => at !== index))}
            aria-label={`Remove ${label.toLowerCase()} ${index + 1} for ${context}`}
            className="mt-xxs px-xs"
          >
            <span className="sr-only">Remove</span>
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        variant="tertiary"
        icon={Plus}
        onClick={() => onChange([...lines, ""])}
        className="self-start"
      >
        {addLabel}
      </Button>
    </fieldset>
  );
}
