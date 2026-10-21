/**
 * End-to-end specification for the asset identity validator.
 *
 * Declarative steps so the browser journey is reviewable before a runner is
 * wired. Placeholders are substituted with fixture addresses at run time.
 * The secret seed must never appear in the page text.
 */
import { copy, errorCopy } from "@/features/asset-identity-validator/copy";

export const spec = {
  route: "/tools/asset-identity-validator",
  offline: true,
  steps: [
    { action: "visit", target: "/tools/asset-identity-validator" },
    { action: "expect", target: "heading", value: "Asset Code & Issuer Identity Validator" },
    { action: "expect", target: "text", value: copy.emptyTitle },
    { action: "fill", target: copy.codeLabel, value: "USDC" },
    { action: "fill", target: copy.issuerLabel, value: "<valid G address>" },
    { action: "click", target: copy.submit },
    { action: "expect", target: "status", value: copy.successTitle },
    { action: "expect", target: "text", value: copy.tierAlphanum4 },
    { action: "expect", target: "text", value: "USDC:<valid G address>" },
    { action: "fill", target: copy.codeLabel, value: "usdc" },
    { action: "click", target: copy.submit },
    { action: "expect", target: "alert", value: errorCopy.invalid_code_characters.title },
    { action: "fill", target: copy.codeLabel, value: "USDC" },
    { action: "fill", target: copy.issuerLabel, value: "<secret S seed>" },
    { action: "click", target: copy.submit },
    { action: "expect", target: "alert", value: errorCopy.invalid_issuer.title },
    { action: "expectAbsent", target: "page", value: "<secret S seed>" }
  ]
} as const;
