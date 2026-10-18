import { DataList } from "@/core/ui";
import { copy } from "../copy";
import type { Sep7Fields } from "../types";

export function RequestFields({ fields }: { fields: Sep7Fields }) {
  return (
    <section>
      <h3>{copy.fieldsTitle}</h3>
      <DataList
        items={[
          { label: "Operation", value: fields.operation },
          { label: "Destination", value: fields.destination },
          { label: "Amount", value: fields.amount || "none" },
          { label: "Asset", value: fields.assetCode ? `${fields.assetCode}:${fields.assetIssuer}` : "XLM" },
          { label: "Memo", value: fields.memo || "none" },
          { label: "Network", value: fields.networkPassphrase || "none" },
          { label: "Callback", value: fields.callback || "none" },
          { label: "Message", value: fields.msg || "none" }
        ]}
      />
    </section>
  );
}
