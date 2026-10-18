import { err, ok, type Result } from "@/core/result/result";
import type {
  HorizonProtocolLedger,
  LedgerProtocolTransitionMapErrorCode,
  ProtocolLedger
} from "@/features/ledger-protocol-transition-map/types";

export function parseProtocolLedger(record: HorizonProtocolLedger): ProtocolLedger | null {
  if (!record || typeof record !== "object") return null;

  const sequenceText =
    record.sequence === undefined || record.sequence === null
      ? ""
      : String(record.sequence).trim();
  const versionText =
    record.protocol_version === undefined || record.protocol_version === null
      ? ""
      : String(record.protocol_version).trim();

  if (!/^\d+$/.test(sequenceText) || !/^\d+$/.test(versionText)) return null;

  const closedAt =
    typeof record.closed_at === "string" && Number.isFinite(Date.parse(record.closed_at))
      ? new Date(Date.parse(record.closed_at)).toISOString()
      : null;

  return {
    sequence: sequenceText,
    protocolVersion: versionText,
    closedAt
  };
}

export function normalizeFetchedLedgers(
  records: HorizonProtocolLedger[]
): Result<{ ledgers: ProtocolLedger[]; malformedCount: number }, LedgerProtocolTransitionMapErrorCode> {
  if (!Array.isArray(records) || records.length === 0) {
    return err("history_unavailable");
  }

  const bySequence = new Map<string, ProtocolLedger>();
  let malformedCount = 0;

  for (const record of records) {
    const parsed = parseProtocolLedger(record);
    if (!parsed) {
      malformedCount += 1;
      continue;
    }
    if (!bySequence.has(parsed.sequence)) {
      bySequence.set(parsed.sequence, parsed);
    }
  }

  const ledgers = [...bySequence.values()].sort((a, b) => compareSequences(a.sequence, b.sequence));

  if (ledgers.length === 0) {
    return err("malformed_ledger");
  }

  return ok({ ledgers, malformedCount });
}

export function compareSequences(a: string, b: string): number {
  if (a.length !== b.length) return a.length - b.length;
  return a < b ? -1 : a > b ? 1 : 0;
}

export function filterToRequestedRange(
  ledgers: ProtocolLedger[],
  startLedger: bigint,
  count: number
): ProtocolLedger[] {
  const endLedger = startLedger + BigInt(count) - 1n;
  return ledgers.filter((ledger) => {
    const sequence = BigInt(ledger.sequence);
    return sequence >= startLedger && sequence <= endLedger;
  });
}
