"use client";

import { useCallback, useState } from "react";
import { isErr, type Result } from "@/core/result/result";
import {
  decodeAssetXdr,
  encodeAssetDescriptor,
} from "@/features/asset-descriptor-codec/lib/assetDescriptorCodec";
import { parseAssetDescriptorInput } from "@/features/asset-descriptor-codec/schema";
import type {
  AssetDescriptor,
  AssetDescriptorErrorCode,
  AssetDescriptorResult,
  DecodeXdrResult,
} from "@/features/asset-descriptor-codec/types";

export type CodecState =
  | { status: "idle" }
  | { status: "success"; result: AssetDescriptorResult | DecodeXdrResult }
  | { status: "error"; code: AssetDescriptorErrorCode };

export function useAssetDescriptorCodec() {
  const [state, setState] = useState<CodecState>({ status: "idle" });

  const convert = useCallback((raw: string) => {
    const parsed = parseAssetDescriptorInput(raw);

    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    const { mode, value } = parsed.value;

    if (mode === "xdr") {
      const result = decodeAssetXdr(value);
      if (isErr(result)) {
        setState({ status: "error", code: result.code });
      } else {
        setState({ status: "success", result: result.value });
      }
      return;
    }

    let descriptor: AssetDescriptor;
    if (mode === "native") {
      descriptor = { kind: "native" };
    } else {
      const colonIdx = value.indexOf(":");
      const code = value.slice(0, colonIdx);
      const issuer = value.slice(colonIdx + 1);
      descriptor = {
        kind: code.length <= 4 ? "credit_alphanum4" : "credit_alphanum12",
        code,
        issuer,
      };
    }

    const result = encodeAssetDescriptor(descriptor);
    if (isErr(result)) {
      setState({ status: "error", code: result.code });
    } else {
      setState({ status: "success", result: result.value });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, convert, reset };
}
