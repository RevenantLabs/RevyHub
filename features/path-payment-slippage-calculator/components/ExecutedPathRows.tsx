import { copy } from "@/features/path-payment-slippage-calculator/copy";
import { formatAsset } from "@/features/path-payment-slippage-calculator/lib/format";
import type { AssetIdentity } from "@/features/path-payment-slippage-calculator/types";
export function ExecutedPathRows({ path }: { path: AssetIdentity[] }) { return <section><h3 className="font-bold">{copy.pathTitle}</h3>{path.length ? <ol>{path.map((asset, index) => <li key={`${formatAsset(asset)}-${index}`}>{index + 1}. {formatAsset(asset)}</li>)}</ol> : <p>{copy.directPath}</p>}</section>; }
