"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import {
  convertFromAmount,
  convertFromStroops,
  maxStroopExample
} from "@/features/amount-converter/lib/amountConverter";
import type {
  AmountConverterErrorCode,
  AmountConverterField,
  AmountConverterResult
} from "@/features/amount-converter/types";

export type AmountConverterState =
  | { status: "idle" }
  | { status: "result"; result: AmountConverterResult; source: AmountConverterField }
  | { status: "error"; code: AmountConverterErrorCode; field: AmountConverterField };

/**
 * Conversion is synchronous and local, so this hook has no loading state:
 * introducing one would only add a fake delay to a pure function.
 */
export function useAmountConverter() {
  const [stroops, setStroops] = useState("");
  const [amount, setAmount] = useState("");
  const [state, setState] = useState<AmountConverterState>({ status: "idle" });

  const applyResult = useCallback(
    (field: AmountConverterField, result: AmountConverterResult) => {
      if (field === "stroops") {
        setAmount(result.amount);
      } else {
        setStroops(result.stroops);
      }
      setState({ status: "result", result, source: field });
    },
    []
  );

  const updateStroops = useCallback(
    (raw: string) => {
      setStroops(raw);
      const trimmed = raw.trim();
      if (!trimmed) {
        setAmount("");
        setState({ status: "idle" });
        return;
      }

      const result = convertFromStroops(trimmed);
      if (isErr(result)) {
        setState({ status: "error", code: result.code, field: "stroops" });
        return;
      }

      applyResult("stroops", result.value);
    },
    [applyResult]
  );

  const updateAmount = useCallback(
    (raw: string) => {
      setAmount(raw);
      const trimmed = raw.trim();
      if (!trimmed) {
        setStroops("");
        setState({ status: "idle" });
        return;
      }

      const result = convertFromAmount(trimmed);
      if (isErr(result)) {
        setState({ status: "error", code: result.code, field: "amount" });
        return;
      }

      applyResult("amount", result.value);
    },
    [applyResult]
  );

  const loadMaxExample = useCallback(() => {
    const result = maxStroopExample();
    setStroops(result.stroops);
    setAmount(result.amount);
    setState({ status: "result", result, source: "stroops" });
  }, []);

  const reset = useCallback(() => {
    setStroops("");
    setAmount("");
    setState({ status: "idle" });
  }, []);

  return {
    stroops,
    amount,
    state,
    updateStroops,
    updateAmount,
    loadMaxExample,
    reset
  };
}
