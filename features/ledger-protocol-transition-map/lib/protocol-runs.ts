import type { ProtocolLedger, ProtocolRun } from "@/features/ledger-protocol-transition-map/types";

/** Groups adjacent ledgers that share the same reported protocol version. */
export function groupProtocolRuns(ledgers: ProtocolLedger[]): ProtocolRun[] {
  if (ledgers.length === 0) return [];

  const runs: ProtocolRun[] = [];
  let current = {
    protocolVersion: ledgers[0]!.protocolVersion,
    startSequence: ledgers[0]!.sequence,
    endSequence: ledgers[0]!.sequence,
    count: 1n
  };

  for (let index = 1; index < ledgers.length; index += 1) {
    const ledger = ledgers[index]!;
    const previous = ledgers[index - 1]!;
    const contiguous = BigInt(ledger.sequence) === BigInt(previous.sequence) + 1n;

    if (contiguous && ledger.protocolVersion === current.protocolVersion) {
      current.endSequence = ledger.sequence;
      current.count += 1n;
      continue;
    }

    runs.push({
      protocolVersion: current.protocolVersion,
      startSequence: current.startSequence,
      endSequence: current.endSequence,
      ledgerCount: current.count.toString()
    });

    current = {
      protocolVersion: ledger.protocolVersion,
      startSequence: ledger.sequence,
      endSequence: ledger.sequence,
      count: 1n
    };
  }

  runs.push({
    protocolVersion: current.protocolVersion,
    startSequence: current.startSequence,
    endSequence: current.endSequence,
    ledgerCount: current.count.toString()
  });

  return runs;
}
