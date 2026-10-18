import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/address-validator/copy";
import { formatKind, formatLength } from "@/features/address-validator/lib/format";
import type { AddressValidationResult } from "@/features/address-validator/types";

export function AddressValidatorResult({ result }: { result: AddressValidationResult }) {
  return (
    <div className="space-y-4">
      <StatusMessage type="success" title={copy.validTitle} />

      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: "Kind", value: formatKind(result.kind) },
            { label: "Prefix", value: result.prefix, mono: true },
            { label: "Length", value: formatLength(result.length) },
            {
              label: "Address",
              value: <CopyableValue label="address" value={result.address} visible={8} />
            }
          ]}
        />
      </Card>
    </div>
  );
}
