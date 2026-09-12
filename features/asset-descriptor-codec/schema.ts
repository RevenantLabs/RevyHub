import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  AssetDescriptorCodecErrorCode,
  AssetDescriptorCodecInput,
  CodecMode
} from "@/features/asset-descriptor-codec/types";

/** Upper bound for input text to prevent resource exhaustion. */
export const MAX_INPUT_LENGTH = 4096;

/** Strict base64 character set and padding pattern. */
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

/** Stellar asset code pattern allowing 1-12 alphanumeric characters. */
export const ASSET_CODE_PATTERN = /^[A-Za-z0-9]{1,12}$/;

/** Flexible raw input accepted by the parser. */
export type RawCodecInput =
  | string
  | {
      mode?: CodecMode;
      value: string;
    };

/**
 * Validates and normalizes raw user input into a strongly-typed codec request.
 *
 * Rejects secret keys and malformed structures without throwing exceptions.
 */
export function parseAssetDescriptorCodecInput(
  raw: RawCodecInput
): Result<AssetDescriptorCodecInput, AssetDescriptorCodecErrorCode> {
  const mode: CodecMode = typeof raw === "string" ? "encode" : (raw.mode ?? "encode");
  const unstripped = typeof raw === "string" ? raw : raw.value;

  if (unstripped === undefined || unstripped === null) {
    return err("empty_input");
  }

  const trimmed = unstripped.trim();
  if (trimmed.length === 0) {
    return err("empty_input");
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    return err("input_too_large");
  }

  if (mode === "decode") {
    const compact = trimmed.replace(/\s+/g, "");
    if (compact.length === 0) {
      return err("empty_input");
    }
    if (/^S/i.test(compact)) {
      return err("invalid_input");
    }
    if (compact.length % 4 !== 0 || !BASE64_PATTERN.test(compact)) {
      return err("invalid_input");
    }
    return ok({ mode: "decode", raw: compact });
  }

  if (/^S/i.test(trimmed)) {
    return err("invalid_input");
  }

  if (trimmed.startsWith("{")) {
    try {
      const parsedJson = JSON.parse(trimmed) as {
        type?: string;
        code?: string;
        issuer?: string | null;
      };
      if (parsedJson.type === "native" || parsedJson.code === "XLM") {
        if (!parsedJson.issuer) {
          return ok({ mode: "encode", raw: "native" });
        }
      }
      if (parsedJson.code && parsedJson.issuer) {
        return parseAssetDescriptorCodecInput({
          mode: "encode",
          value: `${parsedJson.code}:${parsedJson.issuer}`
        });
      }
    } catch {
      return err("invalid_input");
    }
  }

  if (trimmed.toLowerCase() === "native" || trimmed === "XLM") {
    return ok({ mode: "encode", raw: "native" });
  }

  if (!trimmed.includes(":")) {
    return err("invalid_input");
  }

  const segments = trimmed.split(":");
  if (segments.length !== 2) {
    return err("invalid_input");
  }

  const code = segments[0].trim();
  const issuer = segments[1].trim();

  if (!code || !ASSET_CODE_PATTERN.test(code)) {
    return err("invalid_input");
  }

  if (!issuer) {
    return err("invalid_input");
  }

  if (/^S/i.test(issuer)) {
    return err("invalid_issuer");
  }

  if (!StrKey.isValidEd25519PublicKey(issuer)) {
    return err("invalid_issuer");
  }

  return ok({
    mode: "encode",
    raw: `${code}:${issuer}`
  });
}
