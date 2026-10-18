"use client";
import {Card,StatusMessage} from "@/core/ui";
import {useMuxedAccountCodec} from "../hooks/useMuxedAccountCodec";
import {copy,errorCopy} from "../copy";
import {MuxedAccountCodecForm} from "./MuxedAccountCodecForm";
import {MuxedAccountCodecResult} from "./MuxedAccountCodecResult";
import {MuxedAccountCodecEmptyState} from "./MuxedAccountCodecEmptyState";
export function MuxedAccountCodecPanel(){const {state,submit,reset}=useMuxedAccountCodec();return <div className="space-y-5"><p>{copy.description}</p><Card><MuxedAccountCodecForm onSubmit={submit} onEdit={reset} pending={state.status==="loading"}/></Card>
 {state.status==="idle" && <MuxedAccountCodecEmptyState/>}{state.status==="loading" && <p role="status">{copy.loading}</p>}{state.status==="error" && <StatusMessage type="error" {...errorCopy[state.code]}/>}{state.status==="success" && <MuxedAccountCodecResult result={state.result}/>}</div>;}
