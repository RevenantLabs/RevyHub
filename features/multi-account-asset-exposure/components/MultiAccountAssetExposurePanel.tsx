"use client";
import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, errorCopy } from "../copy";
import { useMultiAccountAssetExposure } from "../hooks/useMultiAccountAssetExposure";
import { MultiAccountAssetExposureForm } from "./MultiAccountAssetExposureForm";
import { MultiAccountAssetExposureResult } from "./MultiAccountAssetExposureResult";
import { MultiAccountAssetExposureEmptyState } from "./MultiAccountAssetExposureEmptyState";
export function MultiAccountAssetExposurePanel() {
  const { state, submit } = useMultiAccountAssetExposure();
  return <div className="space-y-5">
    <Card><MultiAccountAssetExposureForm onSubmit={submit} pending={state.status === "loading"} /></Card>
    {state.status === "loading" && <Card><p role="status" className="sr-only">{copy.loading}</p><SkeletonRows rows={4} /></Card>}
    {state.status === "error" && <StatusMessage type="error" title={errorCopy[state.code].title} description={errorCopy[state.code].description} />}
    {state.status === "success" && <MultiAccountAssetExposureResult result={state.result} />}
    {state.status === "idle" && <MultiAccountAssetExposureEmptyState />}
  </div>;
}
