import type { ReactNode } from "react";

import { AppShell } from "@/components/features/layout/AppShell";

interface AuthPageShellProps {
  readonly children: ReactNode;
}

export function AuthPageShell({ children }: AuthPageShellProps): React.JSX.Element {
  return (
    <AppShell mainClassName="mx-auto flex w-full max-w-content items-center justify-center px-md py-xxl sm:px-lg">
      {children}
    </AppShell>
  );
}
