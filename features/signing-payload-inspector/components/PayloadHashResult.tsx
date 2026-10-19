import { copy } from "@/features/signing-payload-inspector/copy";

export function PayloadHashResult({ hex }: { hex: string }) {
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-bold text-[#172033]">{copy.payloadHashTitle}</h4>
      <p className="text-xs text-[#4e5c73]">{copy.payloadHashHint}</p>
      <code className="block break-all rounded-md border border-[#e3ebf5] bg-white/60 p-3 font-mono text-xs" data-testid="payload-hash">{hex}</code>
    </div>
  );
}
