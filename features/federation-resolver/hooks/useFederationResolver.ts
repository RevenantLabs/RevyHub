"use client";

import { useCallback, useRef, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseFederationInput } from "@/features/federation-resolver/schema";
import { resolveFederation } from "@/features/federation-resolver/lib/federation";
import type {
  FederationErrorCode,
  FederationResolution
} from "@/features/federation-resolver/types";

export type FederationResolverState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; resolution: FederationResolution }
  | { status: "error"; code: FederationErrorCode };

/**
 * Federation resolves against a domain, not a Stellar network, so unlike the
 * Horizon-backed slices this state is not tagged with a network — the answer
 * is the same whichever network is selected in the header.
 */
export function useFederationResolver() {
  const [state, setState] = useState<FederationResolverState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(async (raw: string) => {
    const parsed = parseFederationInput(raw);

    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    setState({ status: "loading" });

    const result = await resolveFederation(parsed.value, { signal: next.signal });
    if (next.signal.aborted) return;

    setState(
      result.ok
        ? { status: "success", resolution: result.value }
        : { status: "error", code: result.code }
    );
  }, []);

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
