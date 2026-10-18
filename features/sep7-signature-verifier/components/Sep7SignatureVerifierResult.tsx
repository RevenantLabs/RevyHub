import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/sep7-signature-verifier/copy";
import { formatDomain, formatKey, formatTomlUrl } from "@/features/sep7-signature-verifier/lib/format";
import type { Sep7SignatureVerifierResult as Sep7SignatureVerifierResultValue } from "@/features/sep7-signature-verifier/types";

export function Sep7SignatureVerifierResult({ result }: { result: Sep7SignatureVerifierResultValue }) {
  return (
    <div className="space-y-4">
      <StatusMessage type="success" title={copy.resultTitle} description={copy.verifiedDescription} />
      <Card>
        <CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader>
        <DataList items={[
          { label: copy.labelOrigin, value: formatDomain(result.originDomain), mono: true },
          { label: copy.labelSigningKey, value: formatKey(result.signingKey), mono: true },
          { label: copy.labelToml, value: formatTomlUrl(result.tomlUrl), mono: true }
        ]} />
      </Card>
    </div>
  );
}
