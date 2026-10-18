"use client";
import {Card,StatusMessage} from "@/core/ui";
import {useLedgerRangePlanner} from "../hooks/useLedgerRangePlanner";
import {stableJson} from "../lib/format";
import {copy,errorCopy} from "../copy";
import {LedgerRangePlannerForm} from "./LedgerRangePlannerForm";
import {LedgerRangePlannerResult} from "./LedgerRangePlannerResult";
import {LedgerRangePlannerEmptyState} from "./LedgerRangePlannerEmptyState";
export function LedgerRangePlannerPanel(){const {state,submit,reset}=useLedgerRangePlanner();return <div className="space-y-5"><p>{copy.description}</p><Card><LedgerRangePlannerForm onSubmit={submit} onEdit={reset} pending={state.status==="loading"}/></Card>
 {state.status==="idle" && <LedgerRangePlannerEmptyState/>}{state.status==="loading" && <p role="status">{copy.loading}</p>}{state.status==="error" && <StatusMessage type="error" {...errorCopy[state.code]} description={<>{errorCopy[state.code].description}{state.detail !== undefined && <pre>{stableJson(state.detail)}</pre>}</>}/>}{state.status==="success" && <LedgerRangePlannerResult result={state.result}/>}</div>;}
