import { err, ok, type Result } from "@/core/result/result";
import {
  COUNT_MAX,
  COUNT_MIN,
  type LedgerProtocolTransitionMapErrorCode,
  type LedgerProtocolTransitionMapInput,
  type RawLedgerProtocolTransitionMapForm
} from "@/features/ledger-protocol-transition-map/types";

export function parseLedgerProtocolTransitionMapInput(
  raw: RawLedgerProtocolTransitionMapForm
): Result<LedgerProtocolTransitionMapInput, LedgerProtocolTransitionMapErrorCode> {
  const startText = raw.startLedger.trim();
  const countText = raw.count.trim();

  if (!startText || !/^\d+$/.test(startText) || startText === "0") {
    return err("invalid_start_ledger");
  }

  let startLedger: bigint;
  try {
    startLedger = BigInt(startText);
  } catch {
    return err("invalid_start_ledger");
  }

  if (startLedger < 1n) return err("invalid_start_ledger");

  if (!countText || !/^\d+$/.test(countText)) {
    return err("invalid_count");
  }

  const count = Number(countText);
  if (!Number.isSafeInteger(count) || count < COUNT_MIN || count > COUNT_MAX) {
    return err("invalid_count");
  }

  return ok({ startLedger, count });
}
