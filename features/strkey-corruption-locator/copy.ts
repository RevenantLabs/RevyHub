import type { StrkeyCorruptionLocatorErrorCode } from "@/features/strkey-corruption-locator/types";

export const copy = {
  formLabel: "StrKey to check",
  formHint:
    "Paste a public StrKey that fails its checksum. The check runs in this browser. Never paste a secret seed that starts with S.",
  placeholder: "G... or another public StrKey",
  submit: "Locate corruption",
  submitting: "Checking substitutions",
  emptyTitle: "No StrKey checked yet",
  emptyDescription:
    "Paste a checksum-invalid StrKey. This tool tries every single-character substitution in the StrKey alphabet and lists the ones that validate.",
  loadingTitle: "Checking single-character substitutions",
  loadingDescription:
    "Each position is tested locally against the Stellar StrKey checksum. Nothing is sent over the network.",
  resultTitle: "Likely corrections",
  candidateListLabel: "Ranked single-character corrections",
  substitution: "Position {position}: {from} changed to {to}",
  candidateCount: "{count} single-character correction found",
  candidateCountPlural: "{count} single-character corrections found",
  candidateBound: "Showing {shown} of {total}. Earlier positions are listed first.",
  lengthLabel: "Submitted length",
  correctionsLabel: "Corrections",
  kindLabel: "StrKey kind"
} as const;

export const errorCopy: Record<StrkeyCorruptionLocatorErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Enter a StrKey first",
    description: "Paste the checksum-invalid text into the field above, then run the locator again."
  },
  already_valid: {
    title: "This StrKey already validates",
    description:
      "The checksum is already correct, so there is no corrupted character to locate and no correction is shown. Paste the broken value instead."
  },
  contains_secret_seed: {
    title: "That looks like a secret seed",
    description:
      "Values whose version byte is a secret seed (they start with S) are discarded immediately. No substitution search runs, and the text is not shown. If this was a real seed, treat it as exposed and rotate it."
  },
  invalid_length: {
    title: "That length cannot be a StrKey",
    description:
      "Public StrKeys are 56 characters, muxed accounts are 69, and signed payloads are 56 to 165. Check for a truncated paste or a missing character, then try again."
  },
  no_candidates_found: {
    title: "No single-character fix",
    description:
      "Every one-character substitution in the StrKey alphabet was checked, and none produced a valid checksum. Two or more characters may be wrong, or the text may not be a StrKey. This is a completed check, not a failure of the tool."
  },
  too_long: {
    title: "That string is longer than any StrKey",
    description:
      "Stellar StrKeys stop at 165 characters. Delete the extra copied text so only the key remains, then run the locator again."
  }
};
