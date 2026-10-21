import { unfixableString } from "@/features/strkey-corruption-locator/fixtures/unfixable-string.fixture";
import { copy, errorCopy } from "@/features/strkey-corruption-locator/copy";

/**
 * End-to-end specification for a string that has no single-character repair.
 * The outcome is a status message, not an error alert.
 */
export const spec = {
  route: "/tools/strkey-corruption-locator",
  steps: [
    { action: "visit", target: "/tools/strkey-corruption-locator" },
    { action: "fill", target: copy.formLabel, value: unfixableString },
    { action: "click", target: copy.submit },
    { action: "expect", target: "status", value: errorCopy.no_candidates_found.title },
    { action: "expect", target: "status", value: errorCopy.no_candidates_found.description },
    { action: "expectAbsent", target: "alert", value: errorCopy.no_candidates_found.title }
  ]
} as const;
