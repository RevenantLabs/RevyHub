"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { FIELD_OF_CODE, parseAssetStatisticsInput } from "@/features/asset-statistics/schema";
import { checkAssetStatistics } from "@/features/asset-statistics/lib/assetStatistics";
import type {
  AssetStatisticsErrorCode,
  AssetStatisticsField,
  AssetStatisticsResult
} from "@/features/asset-statistics/types";

export type AssetStatisticsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AssetStatisticsResult }
  | { status: "error"; code: AssetStatisticsErrorCode; field: AssetStatisticsField | null };

const IDLE: AssetStatisticsState = { status: "idle" };

interface Held {
  state: AssetStatisticsState;
  network: StellarNetwork;
}

export function useAssetStatistics() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);

  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: { assetCode: string; issuerId: string }) => {
      const parsed = parseAssetStatisticsInput(raw);

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

      const result = await checkAssetStatistics(parsed.value, network);
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
