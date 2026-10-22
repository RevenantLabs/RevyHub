import { copy, variantCopy } from "@/features/path-payment-slippage-calculator/copy";
import { formatAsset } from "@/features/path-payment-slippage-calculator/lib/format";
import type { AssetIdentity, PathVariant } from "@/features/path-payment-slippage-calculator/types";
export function DeclaredBoundNotice({ variant, amount, asset }: { variant: PathVariant; amount: string; asset: AssetIdentity }) { return <p><strong>{copy.declaredBound}:</strong> {amount} {formatAsset(asset)} — {variantCopy[variant]}</p>; }
