import { Card, CardHeader, CardTitle } from "@/core/ui";
import { copy } from "../copy";
import type { ClawbackEligibilityReport } from "../types";
import { EligibilityVerdict } from "./EligibilityVerdict";
import { HolderSignal } from "./HolderSignal";
import { IssuerSignal } from "./IssuerSignal";

export function ClawbackEligibilityCheckerResult({ result }: { result: ClawbackEligibilityReport }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <IssuerSignal issuer={result.issuer} />
        <HolderSignal holder={result.holder} />
        <EligibilityVerdict verdict={result.verdict} />
      </div>
    </Card>
  );
}
