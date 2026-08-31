"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseTomlValidatorInput } from "@/features/toml-validator/schema";
import { runTomlValidator } from "@/features/toml-validator/lib/tomlValidator";
import { toTomlValidatorErrorCode } from "@/features/toml-validator/lib/tomlValidator.errors";
import type { TomlValidatorErrorCode, TomlValidatorResult } from "@/features/toml-validator/types";

export type TomlValidatorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: TomlValidatorResult }
  | { status: "error"; code: TomlValidatorErrorCode };

export function useTomlValidator() {
  const { network } = useNetwork();
  const [state, setState] = useState<TomlValidatorState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseTomlValidatorInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<TomlValidatorResult, TomlValidatorErrorCode> = await runTomlValidator(
          parsed.value,
          network,
          next.signal
        );
        if (next.signal.aborted) return;
        setState(
          result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code }
        );
      } catch (error) {
        if (next.signal.aborted) return;
        setState({ status: "error", code: toTomlValidatorErrorCode(error) });
      }
    },
    [network]
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
