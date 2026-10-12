import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly description?: string;
  readonly align?: "start" | "center";
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "start",
}: SectionHeadingProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-sm",
        align === "center" && "mx-auto items-center text-center",
      )}
    >
      <p className="text-eyebrow uppercase text-ink-subtle">{eyebrow}</p>
      <h2 id={id} className="text-balance font-display text-headline text-ink sm:text-display-md">
        {title}
      </h2>
      {description ? (
        <p className="text-body text-ink-subtle sm:text-body-lg">{description}</p>
      ) : null}
    </div>
  );
}
