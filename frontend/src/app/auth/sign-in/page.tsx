import type { Metadata } from "next";

import { AuthPage } from "@/components/features/auth/AuthPage";
import { NO_INDEX } from "@/lib/site";

export const metadata: Metadata = { title: "Sign in", robots: NO_INDEX };

export default function SignInPage(): React.JSX.Element {
  return <AuthPage mode="sign-in" />;
}
