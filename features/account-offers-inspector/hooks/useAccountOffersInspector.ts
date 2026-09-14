"use client";

import { useCallback, useState } from "react";
import { fetchAccountOffers } from "@/features/account-offers-inspector/lib/accountOffersInspector";
import type { AccountOffersErrorCode, AccountOffersResult } from "@/features/account-offers-inspector/types";

export type OffersState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AccountOffersResult }
  | { status: "error"; code: AccountOffersErrorCode };

export function useAccountOffersInspector(network: string = "testnet") {
  const [state, setState] = useState<OffersState>({ status: "idle" });

  const submit = useCallback(async (raw: string) => {
    setState({ status: "loading" });

    const parsed = (await import("@/features/account-offers-inspector/schema")).then(m => m.parseAccountOffersInput(raw));
    const parsedResult = await parsed;

    if (!parsedResult.ok) {
      setState({ status: "error", code: parsedResult.code });
      return;
    }

    const result = await fetchAccountOffers(parsedResult.value.accountId, network as any);
    if (!result.ok) {
      setState({ status: "error", code: result.code });
    } else {
      setState({ status: "success", result: result.value });
    }
  }, [network]);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
