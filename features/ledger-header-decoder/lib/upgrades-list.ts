import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { LedgerHeaderDecoderErrorCode, UpgradeSummary } from "@/features/ledger-header-decoder/types";

const numericTypes = {
  1: { type: "protocol_version", read: (upgrade: xdr.LedgerUpgrade) => upgrade.newLedgerVersion() },
  2: { type: "base_fee", read: (upgrade: xdr.LedgerUpgrade) => upgrade.newBaseFee() },
  3: { type: "max_tx_set_size", read: (upgrade: xdr.LedgerUpgrade) => upgrade.newMaxTxSetSize() },
  4: { type: "base_reserve", read: (upgrade: xdr.LedgerUpgrade) => upgrade.newBaseReserve() },
  5: { type: "flags", read: (upgrade: xdr.LedgerUpgrade) => upgrade.newFlags() }
} as const;

/** Every upgrade is an opaque XDR byte vector in StellarValue. Preserve unknown variants. */
export function decodeUpgrades(rawUpgrades: Buffer[]): Result<UpgradeSummary[], LedgerHeaderDecoderErrorCode> {
  const upgrades: UpgradeSummary[] = [];
  for (const raw of rawUpgrades) {
    if (raw.length < 4) return err("malformed_header");
    const typeNumber = raw.readInt32BE(0);
    const rawHex = raw.toString("hex");
    if (typeNumber in numericTypes) {
      try {
        const upgrade = xdr.LedgerUpgrade.fromXDR(raw);
        if (!upgrade.toXDR().equals(raw)) return err("malformed_header");
        const entry = numericTypes[typeNumber as keyof typeof numericTypes];
        upgrades.push({ type: entry.type, value: String(entry.read(upgrade)), rawHex, typeNumber });
      } catch {
        return err("malformed_header");
      }
    } else {
      // New protocol variants and complex config upgrades remain visible as bytes.
      upgrades.push({ type: "unrecognized", value: null, rawHex, typeNumber });
    }
  }
  return ok(upgrades);
}
