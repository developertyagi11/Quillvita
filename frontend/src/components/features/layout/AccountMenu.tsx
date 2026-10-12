"use client";

import { History, LogOut } from "lucide-react";

import { HeaderSignInLink } from "@/components/features/layout/SignInLinks";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAccount } from "@/hooks/useAccount";
import { ROUTES } from "@/lib/routes";

/** Inline account actions for the desktop header. Loaded lazily, since it pulls in the auth client. */
export function AccountMenu(): React.JSX.Element {
  const { state, isSigningOut, signOut } = useAccount();

  if (state.status === "loading") {
    return <Skeleton className="h-8 w-40" />;
  }

  if (state.status === "signed-out") return <HeaderSignInLink />;

  return (
    <nav aria-label="Account" className="flex items-center gap-xs">
      <ButtonLink href={ROUTES.history} size="sm" variant="tertiary" icon={History}>
        History
      </ButtonLink>
      <span
        className="hidden max-w-48 truncate text-body-sm text-ink-subtle xl:inline"
        title={state.email}
      >
        {state.email}
      </span>
      <Button
        size="sm"
        variant="tertiary"
        icon={LogOut}
        isLoading={isSigningOut}
        onClick={() => void signOut()}
      >
        Sign out
      </Button>
    </nav>
  );
}
