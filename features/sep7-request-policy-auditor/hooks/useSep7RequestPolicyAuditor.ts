"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { parseInput } from "../schema";
import { auditRequest } from "../lib/sep7RequestPolicyAuditor";
import { unexpectedFailure } from "../lib/sep7RequestPolicyAuditor.errors";
import type { AuditReport, ErrorCode, RawInput } from "../types";

export type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AuditReport }
  | { status: "error"; code: ErrorCode };

interface Held {
  network: StellarNetwork;
  state: State;
}

export function useSep7RequestPolicyAuditor() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ network, state: { status: "idle" } });
  const generation = useRef(0);

  const reset = useCallback(() => {
    generation.current += 1;
    setHeld({ network, state: { status: "idle" } });
  }, [network]);

  const submit = useCallback(
    async (raw: RawInput) => {
      const current = generation.current + 1;
      generation.current = current;
      const parsed = parseInput(raw);
      if (!parsed.ok) {
        setHeld({ network, state: { status: "error", code: parsed.code } });
        return;
      }
      setHeld({ network, state: { status: "loading" } });
      await Promise.resolve();
      if (generation.current !== current) return;
      try {
        const result = auditRequest(parsed.value.uri, parsed.value.policy);
        setHeld({
          network,
          state: result.ok ? { status: "success", result: result.value } : { status: "error", code: result.code }
        });
      } catch {
        setHeld({ network, state: { status: "error", code: unexpectedFailure() } });
      }
    },
    [network]
  );

  return {
    state: held.network === network ? held.state : ({ status: "idle" } as State),
    submit,
    reset
  };
}
