"use client";
import {Card,StatusMessage} from "@/core/ui";
import {useTrustlineLimitPlanner} from "../hooks/useTrustlineLimitPlanner";
import {copy,errorCopy} from "../copy";
import {TrustlineLimitPlannerForm} from "./TrustlineLimitPlannerForm";
import {TrustlineLimitPlannerResult} from "./TrustlineLimitPlannerResult";
import {TrustlineLimitPlannerEmptyState} from "./TrustlineLimitPlannerEmptyState";
export function TrustlineLimitPlannerPanel(){const {state,submit,reset}=useTrustlineLimitPlanner();return <div className="space-y-5"><p>{copy.description}</p><Card><TrustlineLimitPlannerForm onSubmit={submit} onEdit={reset} pending={state.status==="loading"}/></Card>
 {state.status==="idle" && <TrustlineLimitPlannerEmptyState/>}{state.status==="loading" && <p role="status">{copy.loading}</p>}{state.status==="error" && <StatusMessage type="error" {...errorCopy[state.code]}/>}{state.status==="success" && <TrustlineLimitPlannerResult result={state.result}/>}</div>;}
