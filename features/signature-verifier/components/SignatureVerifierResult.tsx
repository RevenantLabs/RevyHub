import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/signature-verifier/copy";
import type { SignatureVerifierResult as SignatureVerifierResultValue } from "@/features/signature-verifier/types";

export function SignatureVerifierResult({ result }: { result: SignatureVerifierResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList items={[
        { label: "Summary", value: result.summary },
        { label: "Verified", value: result.verified ? "yes" : "no" },
        { label: "Message encoding", value: result.messageEncoding },
        { label: "Signature encoding", value: result.signatureEncoding },
        { label: "Decoded signature bytes", value: String(result.signatureBytes) },
        { label: "Meaning", value: result.explanation },
      ]} />
    </Card>
  );
}
