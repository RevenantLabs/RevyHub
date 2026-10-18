"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { parseInput } from "../schema";
import { verifyCodeHash } from "../lib/contractCodeHashVerifier";
import { unexpectedFailure } from "../lib/contractCodeHashVerifier.errors";
import type { ErrorCode, HashReport, RawInput } from "../types";

export type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: HashReport }
  | { status: "error"; code: ErrorCode };

interface Held {
  network: StellarNetwork;
  state: State;
}

export function useContractCodeHashVerifier() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ network, state: { status: "idle" } });
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const reset = useCallback(() => {
    controller.current?.abort();
    setHeld({ network, state: { status: "idle" } });
  }, [network]);

  const submit = useCallback(
    async (raw: RawInput) => {
      controller.current?.abort();
      const parsed = parseInput(raw);
      if (!parsed.ok) {
        setHeld({ network, state: { status: "error", code: parsed.code } });
        return;
      }
      const next = new AbortController();
      controller.current = next;
      setHeld({ network, state: { status: "loading" } });
      try {
        const result = await verifyCodeHash(parsed.value.contractId, network, next.signal);
        if (next.signal.aborted) return;
        setHeld({ network, state: result.ok ? { status: "success", result: result.value } : { status: "error", code: result.code } });
      } catch {
        if (!next.signal.aborted) setHeld({ network, state: { status: "error", code: unexpectedFailure() } });
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
