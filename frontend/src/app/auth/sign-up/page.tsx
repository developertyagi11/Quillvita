import type { Metadata } from "next";

import { AuthPage } from "@/components/features/auth/AuthPage";
import { NO_INDEX } from "@/lib/site";

export const metadata: Metadata = { title: "Create account", robots: NO_INDEX };

export default function SignUpPage(): React.JSX.Element {
  return <AuthPage mode="sign-up" />;
}
