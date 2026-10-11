"use client";

import { useCallback, useState } from "react";
import {
  generateTestnetKeypair,
  deriveFromSeed,
} from "@/features/testnet-keypair-generator/lib/keypairGenerator";
import type { GeneratedKeypair, KeypairErrorCode } from "@/features/testnet-keypair-generator/types";

export type KeypairState =
  | { status: "idle" }
  | { status: "success"; keypair: GeneratedKeypair }
  | { status: "error"; code: KeypairErrorCode };

export function useKeypairGenerator() {
  const [state, setState] = useState<KeypairState>({ status: "idle" });

  const generate = useCallback(() => {
    const keypair = generateTestnetKeypair();
    setState({ status: "success", keypair });
  }, []);

  const derive = useCallback((seed: string) => {
    const result = deriveFromSeed(seed);
    if (!result.ok) {
      setState({ status: "error", code: result.code });
    } else {
      setState({ status: "success", keypair: result.value });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, generate, derive, reset };
}
