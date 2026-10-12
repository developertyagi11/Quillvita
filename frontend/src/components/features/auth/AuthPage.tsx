import { AuthForm } from "@/components/features/auth/AuthForm";
import { AuthPageShell } from "@/components/features/layout/AuthPageShell";

interface AuthPageProps {
  readonly mode: "sign-in" | "sign-up";
}

export function AuthPage({ mode }: AuthPageProps): React.JSX.Element {
  return (
    <AuthPageShell>
      <AuthForm mode={mode} />
    </AuthPageShell>
  );
}
