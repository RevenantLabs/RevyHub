import { copy } from "@/features/signing-payload-inspector/copy";
import type { SigningPayloadInspectorResult, SigningPayload } from "@/features/signing-payload-inspector/types";

export function formatVariant(variant: SigningPayloadInspectorResult["variant"]): string {
  return {
    "classic-v0": copy.variantClassicV0,
    "classic-v1": copy.variantClassicV1,
    "fee-bump": copy.variantFeeBump
  }[variant];
}
export function formatTag(tag: SigningPayload["tag"]): string {
  return tag === "classic" ? copy.tagClassic : copy.tagFeeBump;
}
export function formatByteLength(length: number): string {
  return `${length.toLocaleString("en-US")} ${copy.bytesUnit}`;
}
