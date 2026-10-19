import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { copy } from "@/features/signing-payload-inspector/copy";

export function NetworkIdDisplay({ hex }: { hex: string }) {
  return (
    <Card>
      <CardHeader><CardTitle>{copy.networkIdTitle}</CardTitle></CardHeader>
      <p className="text-sm text-[#4e5c73]">{copy.networkIdDescription}</p>
      <code className="mt-2 block break-all font-mono text-xs text-[#172033]">{hex}</code>
    </Card>
  );
}
