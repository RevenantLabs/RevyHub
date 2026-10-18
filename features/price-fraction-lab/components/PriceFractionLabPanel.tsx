"use client";
import {Card,StatusMessage} from "@/core/ui";
import {usePriceFractionLab} from "../hooks/usePriceFractionLab";
import {copy,errorCopy} from "../copy";
import {PriceFractionLabForm} from "./PriceFractionLabForm";
import {PriceFractionLabResult} from "./PriceFractionLabResult";
import {PriceFractionLabEmptyState} from "./PriceFractionLabEmptyState";
export function PriceFractionLabPanel(){const {state,submit,reset}=usePriceFractionLab();return <div className="space-y-5"><p>{copy.description}</p><Card><PriceFractionLabForm onSubmit={submit} onEdit={reset} pending={state.status==="loading"}/></Card>
 {state.status==="idle" && <PriceFractionLabEmptyState/>}{state.status==="loading" && <p role="status">{copy.loading}</p>}{state.status==="error" && <StatusMessage type="error" {...errorCopy[state.code]}/>}{state.status==="success" && <PriceFractionLabResult result={state.result}/>}</div>;}
