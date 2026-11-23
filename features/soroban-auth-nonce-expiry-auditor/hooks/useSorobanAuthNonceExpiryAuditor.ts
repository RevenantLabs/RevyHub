"use client";
import { useCallback, useRef, useState } from "react";
import { containsSecretSeed, parseAuditInput, type RawAuditInput } from "../schema";
import { auditSorobanAuth } from "../lib/sorobanAuthNonceExpiryAuditor";
import type { AuditErrorCode, AuditResult } from "../types";
export type AuditState = {status: "idle"} | {status: "loading"} | {status: "success"; result: AuditResult} | {status: "error"; code: AuditErrorCode};
export function useSorobanAuthNonceExpiryAuditor() {
  const [state, setState] = useState<AuditState>({status: "idle"});
  const [redactions, setRedactions] = useState(0);
  const generation = useRef(0);
  const submit = useCallback(async (raw: RawAuditInput) => {
    const current = ++generation.current;
    const parsed = parseAuditInput(raw);
    if (!parsed.ok) {
      if (containsSecretSeed(raw)) setRedactions((value) => value + 1);
      setState({status: "error", code: parsed.code});
      return;
    }
    setState({status: "loading"});
    await Promise.resolve();
    if (current !== generation.current) return;
    const result = auditSorobanAuth(parsed.value);
    if (current !== generation.current) return;
    setState(result.ok ? {status: "success", result: result.value} : {status: "error", code: result.code});
  }, []);
  const reset = useCallback(() => { generation.current++; setState({status: "idle"}); }, []);
  return {state, submit, reset, redactions};
}
