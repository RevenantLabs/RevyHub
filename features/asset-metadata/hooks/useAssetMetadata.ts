"use client";

import { useCallback, useRef, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseDomainInput } from "@/features/asset-metadata/schema";
import { fetchStellarToml } from "@/features/asset-metadata/lib/stellarToml";
import type { AssetMetadataErrorCode, TomlResult } from "@/features/asset-metadata/types";

export type AssetMetadataState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: TomlResult }
  | { status: "error"; code: AssetMetadataErrorCode };

/**
 * A stellar.toml belongs to a domain, not to a Stellar network, so this state
 * carries no network tag — the answer is the same whichever network is
 * selected in the header.
 */
export function useAssetMetadata() {
  const [state, setState] = useState<AssetMetadataState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(async (raw: string) => {
    const parsed = parseDomainInput(raw);

    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    setState({ status: "loading" });

    const result = await fetchStellarToml(parsed.value, { signal: next.signal });
    if (next.signal.aborted) return;

    setState(
      result.ok
        ? { status: "success", result: result.value }
        : { status: "error", code: result.code }
    );
  }, []);

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
