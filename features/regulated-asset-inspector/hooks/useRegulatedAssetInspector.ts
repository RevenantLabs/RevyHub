"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { FIELD_OF_CODE, parseRegulatedAssetInspectorInput } from "@/features/regulated-asset-inspector/schema";
import { runRegulatedAssetInspector } from "@/features/regulated-asset-inspector/lib/regulatedAssetInspector";
import type {
  RegulatedAssetField,
  RegulatedAssetInspectorErrorCode,
  RegulatedAssetInspectorResult
} from "@/features/regulated-asset-inspector/types";

export type RegulatedAssetInspectorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: RegulatedAssetInspectorResult }
  | { status: "error"; code: RegulatedAssetInspectorErrorCode; field: RegulatedAssetField | null };

const IDLE: RegulatedAssetInspectorState = { status: "idle" };

interface Held {
  state: RegulatedAssetInspectorState;
  network: StellarNetwork;
}

export function useRegulatedAssetInspector() {
  const networkState = useNetwork();
  const { network } = networkState;
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: { issuerId: string; assetCode: string }) => {
      const parsed = parseRegulatedAssetInspectorInput(raw);
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
      const result = await runRegulatedAssetInspector(parsed.value, network);
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

  return { state, submit, reset, network: networkState };
}
