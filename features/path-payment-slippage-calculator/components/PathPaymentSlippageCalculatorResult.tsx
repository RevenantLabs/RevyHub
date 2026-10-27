import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { copy } from "@/features/path-payment-slippage-calculator/copy";
import { DeclaredBoundNotice } from "@/features/path-payment-slippage-calculator/components/DeclaredBoundNotice";
import { ExecutedPathRows } from "@/features/path-payment-slippage-calculator/components/ExecutedPathRows";
import { SlippageResult } from "@/features/path-payment-slippage-calculator/components/SlippageResult";
import type { PathPaymentSlippageCalculatorResult as Result } from "@/features/path-payment-slippage-calculator/types";
export function PathPaymentSlippageCalculatorResult({ result }: { result: Result }) { return <Card><CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader><div className="space-y-4"><DeclaredBoundNotice variant={result.variant} amount={result.declaredBound} asset={result.boundAsset} /><p>{copy.actualAmount}: {result.actualAmount}</p><SlippageResult basisPoints={result.slippageBasisPoints} /><ExecutedPathRows path={result.path} /></div></Card>; }
