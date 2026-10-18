"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { runNetworkComparison } from "../lib/networkComparison";
import { parseNetworkComparisonInput } from "../schema";
import type { NetworkComparisonResult, NetworkComparisonErrorCode } from "../types";
export type NetworkComparisonState = {status:"idle"}|{status:"loading"}|{status:"success";result:NetworkComparisonResult}|{status:"error";code:NetworkComparisonErrorCode};
export function useNetworkComparison() {
 const [state,setState] = useState<NetworkComparisonState>({status:"idle"});const controller = useRef<AbortController|null>(null);
 useEffect(() => () => controller.current?.abort(),[]);
 const submit = useCallback(async () => {
  controller.current?.abort(); const parsed = parseNetworkComparisonInput(); if(!parsed.ok){setState({status:"error",code:parsed.code});return;}
  const next = new AbortController();controller.current = next;setState({status:"loading"});
  const r = await runNetworkComparison(next.signal);if(next.signal.aborted)return;setState(r.ok?{status:"success",result:r.value}:{status:"error",code:r.code});
 },[]);
 const reset = useCallback(() => {controller.current?.abort();setState({status:"idle"});},[]);
 return {state,submit,reset};
}
