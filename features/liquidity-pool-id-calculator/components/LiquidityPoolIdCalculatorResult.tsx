import { Card, CardHeader, CardTitle } from "@/core/ui";
import { copy } from "../copy";
import type { LiquidityPoolIdResult } from "../types";
import { CanonicalOrdering } from "./CanonicalOrdering";
import { ComputedPoolId } from "./ComputedPoolId";
import { FeeBoundsNotice } from "./FeeBoundsNotice";

export function LiquidityPoolIdCalculatorResult({ result }: { result: LiquidityPoolIdResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <ComputedPoolId poolIdHex={result.poolIdHex} />
        <CanonicalOrdering ordering={result.ordering} />
        <FeeBoundsNotice feeBps={result.feeBps} />
      </div>
    </Card>
  );
}
