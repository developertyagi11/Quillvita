import type { ReactNode } from "react";

interface PreviewSectionProps {
  readonly title: string;
  readonly children: ReactNode;
}

export function PreviewSection({ title, children }: PreviewSectionProps): React.JSX.Element {
  return (
    <section className="flex flex-col gap-sm border-t border-hairline pt-md">
      <h3 className="text-eyebrow uppercase text-ink-subtle">{title}</h3>
      {children}
    </section>
  );
}
