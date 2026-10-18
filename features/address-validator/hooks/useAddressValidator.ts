"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseAddressInput } from "@/features/address-validator/schema";
import { validateAddress } from "@/features/address-validator/lib/addressValidator";
import type {
  AddressErrorCode,
  AddressValidationResult
} from "@/features/address-validator/types";

export type AddressValidatorState =
  | { status: "idle" }
  | { status: "result"; result: AddressValidationResult }
  | { status: "error"; code: AddressErrorCode };

/**
 * Validation is synchronous and local, so this hook has no loading state:
 * introducing one would only add a fake delay to a pure function.
 */
export function useAddressValidator() {
  const [state, setState] = useState<AddressValidatorState>({ status: "idle" });

  const submit = useCallback((raw: string) => {
    const parsed = parseAddressInput(raw);

    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    const result = validateAddress(parsed.value);
    setState(
      result.valid ? { status: "result", result } : { status: "error", code: result.code }
    );
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
