"use client";

import { useCallback, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { runAssetIdentityValidator } from "@/features/asset-identity-validator/lib/assetIdentityValidator";
import { toAssetIdentityErrorCode } from "@/features/asset-identity-validator/lib/assetIdentityValidator.errors";
import { parseAssetIdentityInput, type RawAssetIdentityInput } from "@/features/asset-identity-validator/schema";
import type {
  AssetIdentity,
  AssetIdentityErrorCode
} from "@/features/asset-identity-validator/types";

export type AssetIdentityValidatorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AssetIdentity }
  | { status: "error"; code: AssetIdentityErrorCode };

/**
 * Local identity check.
 *
 * The selected network is exposed so a change can be observed, and it is
 * intentionally not part of the result. This tool never reads an account
 * or an asset from Horizon.
 */
export function useAssetIdentityValidator(): {
  state: AssetIdentityValidatorState;
  submit: (raw: RawAssetIdentityInput) => Promise<void>;
  reset: () => void;
  network: StellarNetwork;
} {
  const { network } = useNetwork();
  const [state, setState] = useState<AssetIdentityValidatorState>({ status: "idle" });

  const submit = useCallback(async (raw: RawAssetIdentityInput) => {
    const parsed = parseAssetIdentityInput(raw);

    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    setState({ status: "loading" });

    try {
      const result = await runAssetIdentityValidator(parsed.value);
      setState(
        result.ok
          ? { status: "success", result: result.value }
          : { status: "error", code: result.code }
      );
    } catch (error) {
      setState({ status: "error", code: toAssetIdentityErrorCode(error) });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset, network };
}
