"use client";

import { useCallback, useRef, useState } from "react";
import { isErr, type Result } from "@/core/result/result";
import { parseHashCalculatorInput, resolvePassphrase, type RawHashCalculatorForm } from "@/features/hash-calculator/schema";
import { runHashCalculator } from "@/features/hash-calculator/lib/hashCalculator";
import { toHashCalculatorErrorCode } from "@/features/hash-calculator/lib/hashCalculator.errors";
import type {
  HashCalculatorErrorCode,
  HashCalculatorInput,
  HashCalculatorResult,
  NetworkPassphrasePreset
} from "@/features/hash-calculator/types";

/** State machine union representing all lifecycle states of the hash calculator. */
export type HashCalculatorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: HashCalculatorResult }
  | { status: "error"; code: HashCalculatorErrorCode };

/** React hook managing state transitions and hash calculations. */
export function useHashCalculator() {
  const [state, setState] = useState<HashCalculatorState>({ status: "idle" });
  const [lastInput, setLastInput] = useState<HashCalculatorInput | null>(null);
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(async (raw: RawHashCalculatorForm | string) => {
    controller.current?.abort();
    const parsed = parseHashCalculatorInput(raw);
    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    const next = new AbortController();
    controller.current = next;
    setLastInput(parsed.value);
    setState({ status: "loading" });

    try {
      const result: Result<HashCalculatorResult, HashCalculatorErrorCode> =
        await runHashCalculator(parsed.value);
      if (next.signal.aborted) return;
      setState(
        result.ok
          ? { status: "success", result: result.value }
          : { status: "error", code: result.code }
      );
    } catch (error) {
      if (next.signal.aborted) return;
      setState({ status: "error", code: toHashCalculatorErrorCode(error) });
    }
  }, []);

  const switchPassphrase = useCallback(
    async (preset: NetworkPassphrasePreset, customPassphrase = "") => {
      if (!lastInput || lastInput.mode !== "transaction") return;

      const passphraseResult = resolvePassphrase(preset, customPassphrase);
      if (!passphraseResult.ok) {
        setState({ status: "error", code: passphraseResult.code });
        return;
      }

      const nextInput: HashCalculatorInput = {
        ...lastInput,
        passphrasePreset: preset,
        customPassphrase,
        resolvedPassphrase: passphraseResult.value
      };

      controller.current?.abort();
      const next = new AbortController();
      controller.current = next;
      setLastInput(nextInput);
      setState({ status: "loading" });

      try {
        const result = await runHashCalculator(nextInput);
        if (next.signal.aborted) return;
        setState(
          result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code }
        );
      } catch (error) {
        if (next.signal.aborted) return;
        setState({ status: "error", code: toHashCalculatorErrorCode(error) });
      }
    },
    [lastInput]
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setLastInput(null);
    setState({ status: "idle" });
  }, []);

  return { state, lastInput, submit, switchPassphrase, reset };
}
