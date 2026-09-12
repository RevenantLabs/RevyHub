"use client";

import { useCallback, useRef, useState } from "react";
import { isErr } from "@/core/result/result";
import {
  parseAssetDescriptorCodecInput,
  type RawCodecInput
} from "@/features/asset-descriptor-codec/schema";
import { runAssetDescriptorCodec } from "@/features/asset-descriptor-codec/lib/assetDescriptorCodec";
import { toAssetDescriptorCodecErrorCode } from "@/features/asset-descriptor-codec/lib/assetDescriptorCodec.errors";
import type {
  AssetDescriptorCodecErrorCode,
  AssetDescriptorCodecResult
} from "@/features/asset-descriptor-codec/types";

/** Four UI states required by the RevyHubX feature contract. */
export type AssetDescriptorCodecState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AssetDescriptorCodecResult }
  | { status: "error"; code: AssetDescriptorCodecErrorCode };

/**
 * State machine hook for managing the asset descriptor and XDR codec workbench.
 */
export function useAssetDescriptorCodec() {
  const [state, setState] = useState<AssetDescriptorCodecState>({ status: "idle" });
  const requestId = useRef(0);

  const submit = useCallback(async (raw: RawCodecInput) => {
    const parsed = parseAssetDescriptorCodecInput(raw);
    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    requestId.current += 1;
    const currentId = requestId.current;
    setState({ status: "loading" });

    await new Promise((resolve) => setTimeout(resolve, 0));
    if (currentId !== requestId.current) {
      return;
    }

    try {
      const outcome = runAssetDescriptorCodec(parsed.value);
      if (currentId !== requestId.current) {
        return;
      }

      if (outcome.ok) {
        setState({ status: "success", result: outcome.value });
      } else {
        setState({ status: "error", code: outcome.code });
      }
    } catch (error) {
      if (currentId !== requestId.current) {
        return;
      }
      setState({ status: "error", code: toAssetDescriptorCodecErrorCode(error) });
    }
  }, []);

  const reset = useCallback(() => {
    requestId.current += 1;
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
