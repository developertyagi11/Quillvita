import { Suspense } from "react";

import { AuthForm } from "@/components/features/auth/AuthForm";
import { AuthPageShell } from "@/components/features/layout/AuthPageShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { safeNextPath } from "@/lib/redirect";

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface AuthPageProps {
  readonly mode: "sign-in" | "sign-up";
  readonly searchParams: SearchParams;
}

async function AuthFormWithRedirect({
  mode,
  searchParams,
}: AuthPageProps): Promise<React.JSX.Element> {
  const { next } = await searchParams;
  return <AuthForm mode={mode} nextPath={safeNextPath(next)} />;
}

export function AuthPage(props: AuthPageProps): React.JSX.Element {
  return (
    <AuthPageShell>
      <Suspense fallback={<Skeleton className="h-96 w-full max-w-form rounded-lg" />}>
        <AuthFormWithRedirect {...props} />
      </Suspense>
    </AuthPageShell>
  );
}
