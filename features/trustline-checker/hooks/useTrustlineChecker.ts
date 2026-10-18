"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { FIELD_OF_CODE, parseTrustlineInput } from "@/features/trustline-checker/schema";
import { checkTrustline } from "@/features/trustline-checker/lib/trustlineChecker";
import type {
  TrustlineErrorCode,
  TrustlineField,
  TrustlineResult
} from "@/features/trustline-checker/types";

export type TrustlineCheckerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: TrustlineResult }
  | { status: "error"; code: TrustlineErrorCode; field: TrustlineField | null };

const IDLE: TrustlineCheckerState = { status: "idle" };

interface Held {
  state: TrustlineCheckerState;
  network: StellarNetwork;
}

export function useTrustlineChecker() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);

  // An account can trust an asset on one network and not the other, so a
  // result from another network is derived away instead of shown.
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: { accountId: string; assetCode: string; issuerId: string }) => {
      const parsed = parseTrustlineInput(raw);

      if (isErr(parsed)) {
        setHeld({
          state: { status: "error", code: parsed.code, field: FIELD_OF_CODE[parsed.code] },
          network
        });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      setHeld({ state: { status: "loading" }, network });

      const result = await checkTrustline(parsed.value, network);
      if (id !== requestId.current) return;

      setHeld({
        state: result.ok
          ? { status: "success", result: result.value }
          : { status: "error", code: result.code, field: FIELD_OF_CODE[result.code] },
        network
      });
    },
    [network]
  );

  const reset = useCallback(() => {
    requestId.current += 1;
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, submit, reset };
}
