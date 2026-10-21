/**
 * Edge-case journey: the reserved native code XLM must not be paired with an
 * issuer, and the page must not present a canonical credit-asset string.
 */
import { copy, errorCopy } from "@/features/asset-identity-validator/copy";

export const spec = {
  route: "/tools/asset-identity-validator",
  offline: true,
  steps: [
    { action: "visit", target: "/tools/asset-identity-validator" },
    { action: "fill", target: copy.codeLabel, value: "XLM" },
    { action: "fill", target: copy.issuerLabel, value: "<valid G address>" },
    { action: "click", target: copy.submit },
    { action: "expect", target: "alert", value: errorCopy.reserved_native_conflict.title },
    { action: "expect", target: "text", value: errorCopy.reserved_native_conflict.description },
    { action: "expectAbsent", target: "page", value: "XLM:<valid G address>" },
    { action: "expectAbsent", target: "status", value: copy.successTitle }
  ]
} as const;
