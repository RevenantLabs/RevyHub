import { copy } from "@/features/batch-operation-summary/copy";
import { formatNativeAmount } from "@/features/batch-operation-summary/lib/format";
export function NativeAmountTotal({ stroops }: { stroops: string }) { return <div><p className="font-bold">{copy.nativeTotal}: {formatNativeAmount(stroops)}</p><p className="text-sm text-[#68758a]">{copy.nativeOnly}</p></div>; }
