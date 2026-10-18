"use client";
import { Card } from "@/core/ui/Card";
import { Button } from "@/core/ui/Button";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useNetworkComparison } from "../hooks/useNetworkComparison";
import { copy, errorCopy } from "../copy";
import { NetworkComparisonForm } from "./NetworkComparisonForm";
import { NetworkComparisonResult } from "./NetworkComparisonResult";
import { NetworkComparisonEmptyState } from "./NetworkComparisonEmptyState";
export function NetworkComparisonPanel() {
 const {state, submit, reset} = useNetworkComparison();
 return <div className="space-y-5"><Card><NetworkComparisonForm onSubmit={submit} pending={state.status === "loading"}/><Button type="button" variant="secondary" onClick={reset}>{copy.reset}</Button></Card>
 {state.status === "loading" && <p role="status">{copy.loading}</p>}
 {state.status === "error" && <StatusMessage type="error" {...errorCopy[state.code]}/>}
 {state.status === "success" && <NetworkComparisonResult result={state.result}/>}
 {state.status === "idle" && <NetworkComparisonEmptyState/>}</div>;
}
