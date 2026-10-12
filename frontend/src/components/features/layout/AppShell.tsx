import type { ReactNode } from "react";

import { AppFooter } from "@/components/features/layout/AppFooter";
import { AppHeader } from "@/components/features/layout/AppHeader";
import { cn } from "@/lib/cn";

interface AppShellProps {
  readonly children: ReactNode;
  /** Replaces the default padded, content-width column (e.g. for full-bleed landing sections). */
  readonly mainClassName?: string;
  readonly showHeaderCta?: boolean;
}

const DEFAULT_MAIN =
  "mx-auto flex w-full max-w-content flex-col gap-lg px-md py-lg sm:gap-xl sm:px-lg sm:py-xxl";

export function AppShell({
  children,
  mainClassName,
  showHeaderCta = true,
}: AppShellProps): React.JSX.Element {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader showPrimaryCta={showHeaderCta} />
      <main
        id="main"
        tabIndex={-1}
        className={cn("flex-1 outline-none", mainClassName ?? DEFAULT_MAIN)}
      >
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
