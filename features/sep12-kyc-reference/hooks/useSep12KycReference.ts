"use client";

import { useCallback, useState } from "react";
import { searchKycFields } from "@/features/sep12-kyc-reference/lib/kycFields";
import type { KycFieldDescription, Sep12ErrorCode } from "@/features/sep12-kyc-reference/types";

export type Sep12State =
  | { status: "idle" }
  | { status: "success"; results: KycFieldDescription[] }
  | { status: "error"; code: Sep12ErrorCode };

export function useSep12KycReference() {
  const [state, setState] = useState<Sep12State>({ status: "idle" });

  const search = useCallback((query: string, category: string = "all") => {
    const results = searchKycFields(query, category);
    setState({ status: "success", results });
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, search, reset };
}
