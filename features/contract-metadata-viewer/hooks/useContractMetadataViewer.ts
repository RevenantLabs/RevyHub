"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseContractMetadataViewerInput } from "@/features/contract-metadata-viewer/schema";
import { runContractMetadataViewer } from "@/features/contract-metadata-viewer/lib/contractMetadataViewer";
import { toContractMetadataViewerErrorCode } from "@/features/contract-metadata-viewer/lib/contractMetadataViewer.errors";
import type { ContractMetadataViewerErrorCode, ContractMetadataViewerResult } from "@/features/contract-metadata-viewer/types";

export type ContractMetadataViewerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: ContractMetadataViewerResult }
  | { status: "error"; code: ContractMetadataViewerErrorCode };

export function useContractMetadataViewer() {
  const { network } = useNetwork();
  const [state, setState] = useState<ContractMetadataViewerState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseContractMetadataViewerInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<ContractMetadataViewerResult, ContractMetadataViewerErrorCode> = await runContractMetadataViewer(
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
        setState({ status: "error", code: toContractMetadataViewerErrorCode(error) });
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
