import type { ContractEvent, ContractEventType } from "@/features/contract-events/types";

export function formatEventType(type: ContractEventType): string {
  switch (type) {
    case "contract":
      return "Contract";
    case "system":
      return "System";
    case "diagnostic":
      return "Diagnostic";
  }
}

export function formatLedgerRange(startLedger: number, endLedger: number): string {
  return `${startLedger.toLocaleString()} - ${endLedger.toLocaleString()}`;
}

export function formatClosedAt(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function eventKey(event: ContractEvent, index: number): string {
  return `${event.ledger}-${index}-${event.id}`;
}

