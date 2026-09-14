"use client";

import { useState } from "react";
import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useHorizonUrlBuilder } from "@/features/horizon-url-builder/hooks/useHorizonUrlBuilder";
import { copy, errorCopy } from "@/features/horizon-url-builder/copy";
import { HorizonUrlBuilderForm } from "@/features/horizon-url-builder/components/HorizonUrlBuilderForm";
import { HorizonUrlBuilderResult } from "@/features/horizon-url-builder/components/HorizonUrlBuilderResult";
import { HorizonUrlBuilderEmptyState } from "@/features/horizon-url-builder/components/HorizonUrlBuilderEmptyState";

export function HorizonUrlBuilderPanel() {
  const { state, build } = useHorizonUrlBuilder();

  return (
    <div className="space-y-5">
      <Card>
        <HorizonUrlBuilderForm onBuild={build} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <HorizonUrlBuilderResult result={state.result} />
      ) : null}

      {state.status === "idle" ? <HorizonUrlBuilderEmptyState /> : null}
    </div>
  );
}
