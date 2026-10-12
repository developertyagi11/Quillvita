import type { Metadata } from "next";

import { AuthPage } from "@/components/features/auth/AuthPage";
import type { SearchParams } from "@/components/features/auth/AuthPage";
import { NO_INDEX } from "@/lib/site";

export const metadata: Metadata = { title: "Create account", robots: NO_INDEX };

interface SignUpPageProps {
  readonly searchParams: SearchParams;
}

export default function SignUpPage({ searchParams }: SignUpPageProps): React.JSX.Element {
  return <AuthPage mode="sign-up" searchParams={searchParams} />;
}
