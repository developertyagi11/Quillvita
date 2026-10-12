import type { Metadata } from "next";

import { AuthPage } from "@/components/features/auth/AuthPage";
import type { SearchParams } from "@/components/features/auth/AuthPage";
import { NO_INDEX } from "@/lib/site";

export const metadata: Metadata = { title: "Sign in", robots: NO_INDEX };

interface SignInPageProps {
  readonly searchParams: SearchParams;
}

export default function SignInPage({ searchParams }: SignInPageProps): React.JSX.Element {
  return <AuthPage mode="sign-in" searchParams={searchParams} />;
}
