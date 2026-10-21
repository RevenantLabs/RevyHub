import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { decodeUpgrades } from "@/features/ledger-header-decoder/lib/upgrades-list";
import type { LedgerHeaderDecoderErrorCode, ScpValueSummary } from "@/features/ledger-header-decoder/types";

export function decodeScpValue(value: xdr.StellarValue): Result<ScpValueSummary, LedgerHeaderDecoderErrorCode> {
  try {
    const upgrades = decodeUpgrades(value.upgrades());
    if (!upgrades.ok) return upgrades;
    return ok({
      txSetHash: value.txSetHash().toString("hex"),
      closeTime: value.closeTime().toString(),
      upgrades: upgrades.value
    });
  } catch {
    return err("malformed_header");
  }
}
