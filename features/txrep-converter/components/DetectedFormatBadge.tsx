import { copy } from "@/features/txrep-converter/copy";
import { formatDetected } from "@/features/txrep-converter/lib/format";
import type { DetectedFormat } from "@/features/txrep-converter/lib/format-detect";

export function DetectedFormatBadge({ format }: { format: DetectedFormat }) {
  return (
    <p>
      <span className="text-sm text-white/55">{copy.detectedLabel}: </span>
      <span className="text-sm font-medium">{formatDetected(format)}</span>
    </p>
  );
}
