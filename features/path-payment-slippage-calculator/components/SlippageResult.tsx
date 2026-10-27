import { copy } from "@/features/path-payment-slippage-calculator/copy";
import { formatBasisPoints } from "@/features/path-payment-slippage-calculator/lib/format";
export function SlippageResult({ basisPoints }: { basisPoints: string }) { return <p role="status"><strong>{copy.resultTitle}:</strong> {formatBasisPoints(basisPoints)}</p>; }
