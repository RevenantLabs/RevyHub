"use client";

import { useCallback, useRef, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseFaucetInput } from "@/features/testnet-faucet/schema";
import { fundTestnetAccount } from "@/features/testnet-faucet/lib/friendbot";
import type { FaucetErrorCode, FaucetSuccess } from "@/features/testnet-faucet/types";

export type TestnetFaucetState =
  | { status: "idle" }
  | { status: "funding" }
  | { status: "success"; result: FaucetSuccess }
  | { status: "error"; code: FaucetErrorCode };

export function useTestnetFaucet() {
  const [state, setState] = useState<TestnetFaucetState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(async (raw: string) => {
    const parsed = parseFaucetInput(raw);

    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    setState({ status: "funding" });

    const result = await fundTestnetAccount(parsed.value, next.signal);
    if (next.signal.aborted) return;

    setState(
      result.ok
        ? { status: "success", result: result.value }
        : { status: "error", code: result.code }
    );
  }, []);

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
