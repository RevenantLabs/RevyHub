import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toAccountDataEntriesErrorCode } from "@/features/account-data-entries/lib/accountDataEntries.errors";
import type {
  AccountDataEntries,
  AccountDataEntriesErrorCode,
  AccountDataEntriesInput,
  AccountDataEntry,
  DecodedDataValue
} from "@/features/account-data-entries/types";

const CANONICAL_BASE64 =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/;

function sameBytes(left: Uint8Array, right: Uint8Array): boolean {
  return left.length === right.length && left.every((byte, index) => byte === right[index]);
}

/** Decodes one value without allowing a malformed row to fail the account. */
export function decodeDataValue(rawBase64: string): DecodedDataValue {
  if (!CANONICAL_BASE64.test(rawBase64)) return { kind: "invalid_base64" };

  let binary: string;
  try {
    binary = atob(rawBase64);
    if (btoa(binary) !== rawBase64) return { kind: "invalid_base64" };
  } catch {
    return { kind: "invalid_base64" };
  }

  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const roundTrip = new TextEncoder().encode(text);

    if (sameBytes(bytes, roundTrip) && !CONTROL_CHARACTERS.test(text)) {
      return { kind: "text", text, byteLength: bytes.length };
    }
  } catch {
    // Non-UTF-8 bytes are intentionally rendered as hex below.
  }

  return {
    kind: "bytes",
    hex: Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(""),
    byteLength: bytes.length
  };
}

export function decodeDataEntries(data: Record<string, string>): AccountDataEntry[] {
  return Object.entries(data)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, rawBase64]) => ({
      key,
      rawBase64,
      decoded: decodeDataValue(rawBase64)
    }));
}

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function loadAccountDataEntries(
  { accountId }: AccountDataEntriesInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<AccountDataEntries, AccountDataEntriesErrorCode>> {
  try {
    const response = await fetch(horizonUrl(network, `/accounts/${accountId}`), { signal });
    if (!response.ok) return err(toAccountDataEntriesErrorCode({ status: response.status }));

    const payload: unknown = await response.json();
    if (typeof payload !== "object" || payload === null) return err("request_failed");

    const { account_id: responseAccountId, data } = payload as {
      account_id?: unknown;
      data?: unknown;
    };
    if (
      typeof responseAccountId !== "string" ||
      typeof data !== "object" ||
      data === null ||
      Array.isArray(data) ||
      Object.values(data).some((value) => typeof value !== "string")
    ) {
      return err("request_failed");
    }

    return ok({
      accountId: responseAccountId,
      entries: decodeDataEntries(data as Record<string, string>)
    });
  } catch (error) {
    return err(toAccountDataEntriesErrorCode(error));
  }
}
