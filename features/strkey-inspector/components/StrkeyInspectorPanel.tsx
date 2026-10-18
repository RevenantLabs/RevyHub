"use client";
import {Card,StatusMessage} from "@/core/ui";
import {useStrkeyInspector} from "../hooks/useStrkeyInspector";
import {copy,errorCopy} from "../copy";
import {StrkeyInspectorForm} from "./StrkeyInspectorForm";
import {StrkeyInspectorResult} from "./StrkeyInspectorResult";
import {StrkeyInspectorEmptyState} from "./StrkeyInspectorEmptyState";
export function StrkeyInspectorPanel(){const {state,submit,reset}=useStrkeyInspector();return <div className="space-y-5"><p>{copy.description}</p><Card><StrkeyInspectorForm onSubmit={submit} onEdit={reset} pending={state.status==="loading"}/></Card>
 {state.status==="idle" && <StrkeyInspectorEmptyState/>}{state.status==="loading" && <p role="status">{copy.loading}</p>}{state.status==="error" && <StatusMessage type="error" {...errorCopy[state.code]}/>}{state.status==="success" && <StrkeyInspectorResult result={state.result}/>}</div>;}
