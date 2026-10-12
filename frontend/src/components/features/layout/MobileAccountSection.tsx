"use client";

import { History, LogOut, UserRound } from "lucide-react";

import { MobileSignInLinks } from "@/components/features/layout/SignInLinks";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAccount } from "@/hooks/useAccount";
import { ROUTES } from "@/lib/routes";

interface MobileAccountSectionProps {
  readonly onNavigate: () => void;
}

/** Account actions in the mobile menu. Loaded lazily, since it pulls in the auth client. */
export function MobileAccountSection({ onNavigate }: MobileAccountSectionProps): React.JSX.Element {
  const { state, isSigningOut, signOut } = useAccount();

  if (state.status === "loading") return <Skeleton className="h-11 w-full" />;

  if (state.status === "signed-out") return <MobileSignInLinks onNavigate={onNavigate} />;

  return (
    <>
      <p className="flex min-w-0 items-center gap-xs px-sm py-xs text-body-sm text-ink-subtle">
        <UserRound aria-hidden size={16} className="shrink-0" />
        <span className="truncate">{state.email}</span>
      </p>
      <ButtonLink href={ROUTES.history} icon={History} onClick={onNavigate} className="h-11 w-full">
        Your history
      </ButtonLink>
      <Button
        variant="tertiary"
        icon={LogOut}
        isLoading={isSigningOut}
        onClick={() => void signOut().then(onNavigate)}
        className="h-11 w-full"
      >
        Sign out
      </Button>
    </>
  );
}
