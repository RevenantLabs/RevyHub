"use client";

import { useCallback, useRef, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseTestnetKeypairGeneratorInput } from "@/features/testnet-keypair-generator/schema";
import { generateTestnetKeypair } from "@/features/testnet-keypair-generator/lib/testnetKeypairGenerator";
import { toTestnetKeypairGeneratorErrorCode } from "@/features/testnet-keypair-generator/lib/testnetKeypairGenerator.errors";
import type {
  TestnetKeypairGeneratorErrorCode,
  TestnetKeypairGeneratorResult
} from "@/features/testnet-keypair-generator/types";

export type TestnetKeypairGeneratorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: TestnetKeypairGeneratorResult }
  | { status: "error"; code: TestnetKeypairGeneratorErrorCode };

export function useTestnetKeypairGenerator() {
  const [state, setState] = useState<TestnetKeypairGeneratorState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (rawLabel: string = "", checkNetwork: boolean = true) => {
      controller.current?.abort();

      const parsed = parseTestnetKeypairGeneratorInput(rawLabel, checkNetwork);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result = await generateTestnetKeypair(parsed.value, next.signal);
        if (next.signal.aborted) return;

        setState(
          result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code }
        );
      } catch (error) {
        if (next.signal.aborted) return;
        setState({
          status: "error",
          code: toTestnetKeypairGeneratorErrorCode(error)
        });
      }
    },
    []
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
