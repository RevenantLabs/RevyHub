import type { SorobanFootprintDiffErrorCode } from "@/features/soroban-footprint-diff/types";
import { MAX_INPUT_CHARS } from "@/features/soroban-footprint-diff/types";

export const copy = {
  firstLabel: "First simulation result JSON",
  secondLabel: "Second simulation result JSON",
  formHint: "Paste two simulation-result JSON payloads. Nothing is sent or stored.",
  submit: "Compare footprints",
  loading: "Comparing footprints locally...",
  emptyTitle: "No footprint comparison yet",
  emptyDescription:
    "Compare read-only and read-write ledger keys from two pasted simulation results. A footprint is a proposal for one simulated transaction, not proof of a later ledger write.",
  resultTitle: "Footprint difference",
  addedTitle: "Keys added in the second result",
  removedTitle: "Keys removed in the second result",
  modeTitle: "Access mode changes",
  resourcesTitle: "Simulation resources",
  firstResourcesLabel: "First result",
  secondResourcesLabel: "Second result",
  noAdded: "No keys were added.",
  noRemoved: "No keys were removed.",
  noModeChanges: "No access-mode changes.",
  feeLabel: "minResourceFee",
  cpuLabel: "cpuInsns",
  memLabel: "memBytes",
  simulationNote: "Simulation output only — not a confirmed ledger write.",
  disclaimer:
    "A simulation footprint is a proposal for one simulated transaction, not proof of a later ledger write."
} as const;

export const errorCopy: Record<
  SorobanFootprintDiffErrorCode,
  { title: string; description: string }
> = {
  empty_first_result: {
    title: "First simulation result is empty",
    description: "Paste the first simulation-result JSON payload."
  },
  empty_second_result: {
    title: "Second simulation result is empty",
    description: "Paste the second simulation-result JSON payload."
  },
  invalid_json: {
    title: "Simulation JSON is not valid",
    description:
      "Each payload must be JSON with a footprint.readOnly and footprint.readWrite array."
  },
  invalid_footprint_xdr: {
    title: "A footprint ledger key could not be decoded",
    description:
      "One or more footprint entries looked like XDR but failed to decode as a LedgerKey."
  },
  too_large: {
    title: "Pasted payload is too large",
    description: `Keep each simulation result under ${MAX_INPUT_CHARS} characters. Nothing is persisted.`
  }
};
