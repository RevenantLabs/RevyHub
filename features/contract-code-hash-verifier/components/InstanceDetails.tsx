import { DataList } from "@/core/ui";
import { formatLedger } from "../lib/format";
import type { InstanceView } from "../types";

export function InstanceDetails({ instance }: { instance: InstanceView }) {
  return (
    <DataList
      items={[
        { label: "Executable", value: instance.kind === "builtin" ? "Stellar asset contract" : "Wasm" },
        { label: "Instance hash", value: instance.hash ?? "none", mono: true },
        { label: "Instance latest ledger", value: formatLedger(instance.marker.latestLedger) },
        { label: "Instance last modified", value: formatLedger(instance.marker.lastModifiedLedgerSeq) }
      ]}
    />
  );
}
