"use client";
import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useLedgerLookup } from "../hooks/useLedgerLookup";
import { copy, errorCopy } from "../copy";
import { LedgerLookupForm } from "./LedgerLookupForm";
import { LedgerLookupResult } from "./LedgerLookupResult";
import { LedgerLookupEmptyState } from "./LedgerLookupEmptyState";
export function LedgerLookupPanel() {
 const {state, submit, reset} = useLedgerLookup();
 return <div className="space-y-5"><Card><LedgerLookupForm onSubmit={submit} pending={state.status === "loading"} onChange={reset} onReset={reset}/></Card>
 {state.status === "loading" && <p role="status">{copy.loading}</p>}
 {state.status === "error" && <StatusMessage type="error" {...errorCopy[state.code]} description={<>{errorCopy[state.code].description}{state.currentHeight !== undefined && <p>{copy.currentHeight}: {state.currentHeight}</p>}</>}/>}
 {state.status === "success" && <LedgerLookupResult result={state.result}/>}
 {state.status === "idle" && <LedgerLookupEmptyState/>}</div>;
}
