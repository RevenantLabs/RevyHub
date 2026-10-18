"use client";
import {Card,StatusMessage} from "@/core/ui";
import {useHashCalculator} from "../hooks/useHashCalculator";
import {copy,errorCopy} from "../copy";
import {HashCalculatorForm} from "./HashCalculatorForm";
import {HashCalculatorResult} from "./HashCalculatorResult";
import {HashCalculatorEmptyState} from "./HashCalculatorEmptyState";
export function HashCalculatorPanel(){const {state,submit,reset}=useHashCalculator();return <div className="space-y-5"><p>{copy.description}</p><Card><HashCalculatorForm onSubmit={submit} onEdit={reset} pending={state.status==="loading"}/></Card>
 {state.status==="idle" && <HashCalculatorEmptyState/>}{state.status==="loading" && <p role="status">{copy.loading}</p>}{state.status==="error" && <StatusMessage type="error" {...errorCopy[state.code]}/>}{state.status==="success" && <HashCalculatorResult result={state.result}/>}</div>;}
