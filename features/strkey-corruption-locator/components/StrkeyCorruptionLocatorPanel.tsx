"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { NoCandidatesNotice } from "@/features/strkey-corruption-locator/components/NoCandidatesNotice";
import { SecretSeedGuard } from "@/features/strkey-corruption-locator/components/SecretSeedGuard";
import { StrkeyCorruptionLocatorEmptyState } from "@/features/strkey-corruption-locator/components/StrkeyCorruptionLocatorEmptyState";
import { StrkeyCorruptionLocatorForm } from "@/features/strkey-corruption-locator/components/StrkeyCorruptionLocatorForm";
import { StrkeyCorruptionLocatorResult } from "@/features/strkey-corruption-locator/components/StrkeyCorruptionLocatorResult";
import { copy, errorCopy } from "@/features/strkey-corruption-locator/copy";
import { useStrkeyCorruptionLocator } from "@/features/strkey-corruption-locator/hooks/useStrkeyCorruptionLocator";

export function StrkeyCorruptionLocatorPanel() {
  const { state, submit } = useStrkeyCorruptionLocator();
  const errorCode = state.status === "error" ? state.code : null;

  return (
    <div className="w-full min-w-0 max-w-full space-y-5">
      <Card className="min-w-0">
        <StrkeyCorruptionLocatorForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "loading" ? (
        <StatusMessage type="info" title={copy.loadingTitle} description={copy.loadingDescription} />
      ) : null}

      {errorCode === "contains_secret_seed" ? <SecretSeedGuard /> : null}

      {errorCode && errorCode !== "contains_secret_seed" && errorCode !== "no_candidates_found" ? (
        <StatusMessage type="error" title={errorCopy[errorCode].title} description={errorCopy[errorCode].description} />
      ) : null}

      {state.status === "no_candidates" || errorCode === "no_candidates_found" ? <NoCandidatesNotice /> : null}

      {state.status === "success" ? <StrkeyCorruptionLocatorResult result={state.result} /> : null}

      {state.status === "idle" ? <StrkeyCorruptionLocatorEmptyState /> : null}
    </div>
  );
}
