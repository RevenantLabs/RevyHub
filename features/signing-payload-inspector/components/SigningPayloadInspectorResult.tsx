import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/signing-payload-inspector/copy";
import { formatByteLength, formatTag, formatVariant } from "@/features/signing-payload-inspector/lib/format";
import type { SigningPayload, SigningPayloadInspectorResult as Result } from "@/features/signing-payload-inspector/types";
import { NetworkIdDisplay } from "@/features/signing-payload-inspector/components/NetworkIdDisplay";
import { SignatureBaseBytes } from "@/features/signing-payload-inspector/components/SignatureBaseBytes";
import { PayloadHashResult } from "@/features/signing-payload-inspector/components/PayloadHashResult";

function PayloadCard({ title, payload }: { title: string; payload: SigningPayload }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <DataList items={[
        { label: copy.tagLabel, value: formatTag(payload.tag), mono: true },
        { label: copy.byteLengthLabel, value: formatByteLength(payload.byteLength) }
      ]} />
      <div className="mt-4 space-y-5">
        <SignatureBaseBytes hex={payload.signatureBaseHex} />
        <PayloadHashResult hex={payload.payloadHashHex} />
      </div>
    </Card>
  );
}

export function SigningPayloadInspectorResult({ result }: { result: Result }) {
  return (
    <section className="space-y-5" aria-label={copy.resultTitle}>
      <Card>
        <CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader>
        <DataList items={[
          { label: copy.variantLabel, value: formatVariant(result.variant) },
          { label: copy.networkLabelResult, value: result.network === "testnet" ? copy.testnet : copy.mainnet }
        ]} />
      </Card>
      <NetworkIdDisplay hex={result.networkIdHex} />
      {result.inner ? <p className="text-sm text-[#4e5c73]">{copy.feeBumpNote}</p> : null}
      <PayloadCard title={result.inner ? copy.outerTitle : copy.classicTitle} payload={result.outer} />
      {result.inner ? <PayloadCard title={copy.innerTitle} payload={result.inner} /> : null}
    </section>
  );
}
