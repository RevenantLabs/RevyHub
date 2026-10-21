import { CodeBlock } from "@/core/ui/CodeBlock";
import { copy } from "@/features/txrep-converter/copy";
import type { DetectedFormat } from "@/features/txrep-converter/lib/format-detect";

export function ConversionOutput({ value, format }: { value: string; format: DetectedFormat }) {
  return <CodeBlock label={format === "xdr" ? copy.outputXdr : copy.outputTxrep}>{value}</CodeBlock>;
}
