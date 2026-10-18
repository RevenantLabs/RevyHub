"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { parseInput } from "../schema";
import { checkArguments } from "../lib/contractCallArgumentChecker";
import { unexpectedFailure } from "../lib/contractCallArgumentChecker.errors";
import type { ArgumentReport, ErrorCode, RawInput } from "../types";

export type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: ArgumentReport }
  | { status: "error"; code: ErrorCode };

export function useContractCallArgumentChecker() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<{ network: StellarNetwork; state: State }>({ network, state: { status: "idle" } });
  const generation = useRef(0);
  useEffect(() => () => { generation.current += 1; }, []);

  const reset = useCallback(() => {
    generation.current += 1;
    setHeld({ network, state: { status: "idle" } });
  }, [network]);

  const submit = useCallback(async (raw: RawInput) => {
    const id = ++generation.current;
    const parsed = parseInput(raw);
    if (!parsed.ok) {
      setHeld({ network, state: { status: "error", code: parsed.code } });
      return;
    }
    setHeld({ network, state: { status: "loading" } });
    await Promise.resolve();
    try {
      const result = checkArguments(parsed.value);
      if (id !== generation.current) return;
      setHeld({ network, state: result.ok ? { status: "success", result: result.value } : { status: "error", code: result.code } });
    } catch {
      if (id === generation.current) setHeld({ network, state: { status: "error", code: unexpectedFailure() } });
    }
  }, [network]);

  return { state: held.network === network ? held.state : ({ status: "idle" } as State), submit, reset };
}
