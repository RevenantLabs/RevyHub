import { singleCharTypo, originalPublicKey } from "@/features/strkey-corruption-locator/fixtures/single-char-typo.fixture";
import { copy, errorCopy } from "@/features/strkey-corruption-locator/copy";

/**
 * End-to-end specification for the main locator journey.
 * Steps are declarative so the browser behaviour is reviewable before a runner executes them.
 */
export const spec = {
  route: "/tools/strkey-corruption-locator",
  steps: [
    { action: "visit", target: "/tools/strkey-corruption-locator" },
    { action: "expect", target: "heading", value: "StrKey Corruption Locator" },
    { action: "expect", target: "status", value: copy.emptyTitle },
    { action: "fill", target: copy.formLabel, value: singleCharTypo },
    { action: "click", target: copy.submit },
    { action: "expect", target: "status", value: copy.resultTitle },
    { action: "expect", target: "text", value: originalPublicKey },
    { action: "fill", target: copy.formLabel, value: "<S-prefixed secret seed>" },
    { action: "click", target: copy.submit },
    { action: "expect", target: "status", value: errorCopy.contains_secret_seed.title },
    { action: "expectAbsent", target: "page", value: "<S-prefixed secret seed>" }
  ]
} as const;
