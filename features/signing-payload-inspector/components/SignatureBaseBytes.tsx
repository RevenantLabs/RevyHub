import { copy } from "@/features/signing-payload-inspector/copy";

export function SignatureBaseBytes({ hex }: { hex: string }) {
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-bold text-[#172033]">{copy.signatureBaseTitle}</h4>
      <p className="text-xs text-[#4e5c73]">{copy.signatureBaseHint}</p>
      <code className="block max-h-64 overflow-auto break-all rounded-md border border-[#e3ebf5] bg-white/60 p-3 font-mono text-xs" data-testid="signature-base">{hex}</code>
    </div>
  );
}
