"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useState } from "react";
import type { FormEvent } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { authClient } from "@/lib/auth/client";
import { setSessionHint } from "@/lib/auth/session-hint";
import { clearAccessToken } from "@/lib/auth/token";
import { cn } from "@/lib/cn";
import { DEFAULT_NEXT_PATH, safeNextPath } from "@/lib/redirect";
import { ROUTES } from "@/lib/routes";

type AuthMode = "sign-in" | "sign-up";

interface AuthFormProps {
  readonly mode: AuthMode;
}

const MIN_PASSWORD_LENGTH = 8;

const COPY: Readonly<
  Record<AuthMode, { title: string; description: string; submit: string; pending: string }>
> = {
  "sign-in": {
    title: "Sign in to Quillvita",
    description: "See your past resumes and tailoring results.",
    submit: "Sign in",
    pending: "Signing in…",
  },
  "sign-up": {
    title: "Create your account",
    description: "Every resume you tailor is saved to your history.",
    submit: "Create account",
    pending: "Creating account…",
  },
};

const INPUT_CLASSES = cn(
  "h-11 w-full rounded-md border border-hairline bg-canvas px-sm text-body-sm text-ink",
  "placeholder:text-ink-tertiary transition-colors duration-fast ease-standard",
  "focus-visible:border-hairline-strong",
);

interface FieldProps {
  readonly label: string;
  readonly name: string;
  readonly type: "text" | "email" | "password";
  readonly autoComplete: string;
  readonly minLength?: number | undefined;
  readonly hint?: string | undefined;
  readonly error?: string | null | undefined;
}

function Field({
  label,
  name,
  type,
  autoComplete,
  minLength,
  hint,
  error,
}: FieldProps): React.JSX.Element {
  const id = useId();
  const [isRevealed, setIsRevealed] = useState(false);
  const isPassword = type === "password";
  const message = error ?? hint;
  const messageId = `${id}-message`;

  return (
    <div className="flex flex-col gap-xs">
      <label htmlFor={id} className="text-body-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={isPassword && isRevealed ? "text" : type}
          required
          autoComplete={autoComplete}
          minLength={minLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={cn(INPUT_CLASSES, isPassword && "pr-11", error && "border-danger/60")}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setIsRevealed(!isRevealed)}
            aria-label={isRevealed ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={isRevealed}
            aria-controls={id}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-ink-subtle transition-colors duration-fast ease-standard hover:text-ink"
          >
            {isRevealed ? <EyeOff aria-hidden size={18} /> : <Eye aria-hidden size={18} />}
          </button>
        ) : null}
      </div>
      {message ? (
        <p
          id={messageId}
          role={error ? "alert" : undefined}
          className={cn("text-caption", error ? "text-danger" : "text-ink-subtle")}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

function readField(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

// Read in the browser rather than from server `searchParams`, so the form is part of the
// prerendered page instead of waiting for a server render.
function readNextPath(): string {
  return safeNextPath(new URLSearchParams(window.location.search).get("next") ?? undefined);
}

function SwitchModeLink({ mode }: AuthFormProps): React.JSX.Element {
  const nextPath = safeNextPath(useSearchParams().get("next") ?? undefined);
  return <SwitchModeAnchor mode={mode} nextPath={nextPath} />;
}

function SwitchModeAnchor({
  mode,
  nextPath,
}: AuthFormProps & { readonly nextPath: string }): React.JSX.Element {
  return (
    <Link
      href={{
        pathname: mode === "sign-in" ? ROUTES.signUp : ROUTES.signIn,
        query: nextPath === DEFAULT_NEXT_PATH ? {} : { next: nextPath },
      }}
      className="text-ink underline-offset-4 hover:underline"
    >
      {mode === "sign-in" ? "Create an account" : "Sign in"}
    </Link>
  );
}

export function AuthForm({ mode }: AuthFormProps): React.JSX.Element {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const copy = COPY[mode];
  const isSignedIn = Boolean(session);

  useEffect(() => {
    if (!isSignedIn) return;
    setSessionHint(true);
    router.replace(readNextPath());
  }, [isSignedIn, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = readField(form, "email");
    const password = form.get("password");
    if (typeof password !== "string") return;
    if (mode === "sign-up" && form.get("confirmPassword") !== password) {
      setConfirmError("Passwords don't match.");
      return;
    }

    setIsPending(true);
    setError(null);
    setNotice(null);
    try {
      const result =
        mode === "sign-in"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ email, password, name: readField(form, "name") });
      if (result.error) {
        setError(result.error.message ?? "That didn't work. Please try again.");
        return;
      }
      if (!result.data.token) {
        setNotice("Check your inbox to verify your email, then sign in.");
        return;
      }
      clearAccessToken();
      setSessionHint(true);
      router.replace(readNextPath());
      router.refresh();
    } catch {
      setError("We couldn't reach the sign-in service. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="w-full max-w-form p-md sm:p-lg">
      <h1 className="text-card-title text-ink">{copy.title}</h1>
      <p className="mt-xxs text-body-sm text-ink-subtle">{copy.description}</p>
      <form
        onSubmit={(event) => void handleSubmit(event)}
        onInput={() => setConfirmError(null)}
        className="mt-lg flex flex-col gap-md"
      >
        {mode === "sign-up" ? (
          <Field label="Name" name="name" type="text" autoComplete="name" />
        ) : null}
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          minLength={mode === "sign-up" ? MIN_PASSWORD_LENGTH : undefined}
          hint={mode === "sign-up" ? `At least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
        />
        {mode === "sign-up" ? (
          <Field
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            error={confirmError}
          />
        ) : null}
        {error ? <Alert tone="danger" title={error} /> : null}
        {notice ? <Alert tone="success" title={notice} /> : null}
        <Button type="submit" variant="primary" isLoading={isPending} className="h-11">
          {isPending ? copy.pending : copy.submit}
        </Button>
      </form>
      <p className="mt-md text-body-sm text-ink-subtle">
        {mode === "sign-in" ? "New to Quillvita? " : "Already have an account? "}
        <Suspense fallback={<SwitchModeAnchor mode={mode} nextPath={DEFAULT_NEXT_PATH} />}>
          <SwitchModeLink mode={mode} />
        </Suspense>
      </p>
    </Card>
  );
}
