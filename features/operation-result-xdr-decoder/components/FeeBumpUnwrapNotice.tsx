import { StatusMessage } from "@/core/ui/StatusMessage";
import { DataList } from "@/core/ui/DataList";
import { copy } from "../copy";
import { formatFee } from "../lib/format";
import type { OperationResultXdrDecoderResult } from "../types";
export function FeeBumpUnwrapNotice({ result }: { result: OperationResultXdrDecoderResult }) {
  if (!result.feeBump) return null;
  return <div className="space-y-3"><StatusMessage type="info" title={copy.feeBumpTitle} description={copy.feeBumpDescription} /><DataList items={[{ label: copy.outerLabel, value: result.outer.code, mono: true }, { label: copy.innerLabel, value: result.transaction.code, mono: true }, ...(result.innerFeeCharged ? [{ label: copy.innerFeeLabel, value: formatFee(result.innerFeeCharged) }] : [])]} /></div>;
}
