import { DataList } from "@/core/ui";
import { formatLedger } from "../lib/format";
import type { CodeView } from "../types";

export function CodeDetails({ code }: { code: CodeView }) {
  return (
    <DataList
      items={[
        { label: "Wasm bytes", value: String(code.size) },
        { label: "Computed hash", value: code.hash, mono: true },
        { label: "Code latest ledger", value: formatLedger(code.marker.latestLedger) },
        { label: "Code last modified", value: formatLedger(code.marker.lastModifiedLedgerSeq) }
      ]}
    />
  );
}
