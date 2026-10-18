"use client";
import { Card } from "@/core/ui/Card";
import { Button } from "@/core/ui/Button";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useHorizonHealth } from "../hooks/useHorizonHealth";
import { copy, errorCopy } from "../copy";
import { HorizonHealthForm } from "./HorizonHealthForm";
import { HorizonHealthResult } from "./HorizonHealthResult";
import { HorizonHealthEmptyState } from "./HorizonHealthEmptyState";
export function HorizonHealthPanel() {
 const {state, submit, reset} = useHorizonHealth();
 return <div className="space-y-5"><Card><HorizonHealthForm onSubmit={submit} pending={state.status === "loading"}/><Button type="button" variant="secondary" onClick={reset}>{copy.reset}</Button></Card>
 {state.status === "loading" && <p role="status">{copy.loading}</p>}
 {state.status === "error" && <StatusMessage type="error" {...errorCopy[state.code]}/>}
 {state.status === "success" && <HorizonHealthResult result={state.result}/>}
 {state.status === "idle" && <HorizonHealthEmptyState/>}</div>;
}
