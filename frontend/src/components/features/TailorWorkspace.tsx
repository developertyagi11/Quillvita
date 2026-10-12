"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";

import { CustomizeFormView } from "@/components/features/form/CustomizeFormView";
import { ResultsView } from "@/components/features/results/ResultsView";
import { LoadingPanel } from "@/components/features/status/LoadingPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useBackendWarmup } from "@/hooks/useBackendWarmup";
import { useCustomizeForm } from "@/hooks/useCustomizeForm";
import { useCustomizeResume } from "@/hooks/useCustomizeResume";
import { useToast } from "@/hooks/useToast";

export function TailorWorkspace(): React.JSX.Element {
  useBackendWarmup();
  const { state, lastInput, submit, reset } = useCustomizeResume();
  const form = useCustomizeForm((input) => void submit(input));
  const toast = useToast();
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "success" || state.status === "loading") {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state.status]);

  const savedId = state.status === "success" ? state.data.history_id : null;
  useEffect(() => {
    if (savedId) {
      toast.show({
        tone: "success",
        title: "Saved to your history",
        description: "Find this resume and its results under History anytime.",
      });
    }
  }, [savedId, toast]);

  return (
    <div ref={topRef} className="flex scroll-mt-20 flex-col gap-lg">
      {state.status === "error" ? (
        <Alert
          tone="danger"
          title="We couldn't tailor your resume"
          action={
            lastInput ? (
              <Button size="sm" icon={RotateCcw} onClick={() => void submit(lastInput)}>
                Try again
              </Button>
            ) : null
          }
        >
          {state.message}
        </Alert>
      ) : null}

      {state.status === "loading" ? <LoadingPanel onCancel={reset} /> : null}

      {state.status === "success" ? (
        <ResultsView
          result={state.data}
          jobDescription={lastInput?.jobDescription ?? ""}
          onEdit={reset}
        />
      ) : null}

      {state.status === "idle" || state.status === "error" ? (
        <CustomizeFormView form={form} />
      ) : null}
    </div>
  );
}
