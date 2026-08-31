import type {
  AccountSignersErrorCode,
  ThresholdLevel
} from "@/features/account-signers/types";

export const copy = {
  formLabel: "Account address",
  formHint:
    "Paste a Stellar public account address. Signers and thresholds are public account data.",
  formHintForNetwork: (networkLabel: string) =>
    `Paste a Stellar public account address. Signers and thresholds are public account data. Reading from ${networkLabel}.`,
  formPlaceholder: "GABC...XYZ",
  submit: "Inspect signers",
  loading: "Loading signers and thresholds...",
  emptyTitle: "No account inspected yet",
  emptyDescription:
    "Paste an account address to see who can authorize it and how much signer weight each operation requires.",
  resultTitle: "Account authorization",
  accountLabel: "Account",
  totalWeightLabel: "Total signer weight",
  normalAccountLabel: "Normal account",
  multisigAccountLabel: "Multisig setup",
  customAccountLabel: "Custom single-signer setup",
  normalAccountTitle: "Normal, non-multisig account",
  normalAccountDescription:
    "This account has only its master-key signer with weight 1 and the default low, medium, and high thresholds of 0.",
  multisigAccountTitle: "Account authorization setup",
  multisigAccountDescription:
    "Compare each signer's weight with the thresholds below to understand which combinations can authorize operations.",
  customAccountDescription:
    "This account has one signer but does not use the default authorization settings. Compare its signer weight with every threshold below.",
  masterDisabledTitle: "Master key disabled",
  masterDisabledDescription:
    "The master-key signer has weight 0, so the account cannot authorize operations with its own key. Other configured signers must provide the required weight.",
  signersTitle: "Signers",
  signerKeyColumn: "Signer key",
  signerWeightColumn: "Weight",
  signerTypeColumn: "Type",
  signerRoleColumn: "Role",
  masterKeyLabel: "Master key",
  additionalSignerLabel: "Additional signer",
  disabledLabel: "Disabled",
  thresholdsTitle: "Thresholds",
  thresholdLevelColumn: "Threshold",
  thresholdOperationsColumn: "Operations gated",
  thresholdRequiredColumn: "Required weight",
  thresholdAvailableColumn: "Total available",
  thresholdStatusColumn: "Status",
  thresholdReachableLabel: "Can be met",
  thresholdUnreachableLabel: "Cannot be met",
  thresholdUnreachableDescription: (shortfall: string) =>
    `This threshold is higher than the total weight of every signer combined. Missing weight: ${shortfall}.`,
  signerTableCaption: (accountId: string) => `Signers configured for account ${accountId}`,
  signerCopyLabel: (position: number) => `signer ${position} key`,
  thresholdTableCaption: (accountId: string) =>
    `Authorization thresholds configured for account ${accountId}`,
  thresholdLabels: {
    low: "Low",
    medium: "Medium",
    high: "High"
  } satisfies Record<ThresholdLevel, string>,
  thresholdDescriptions: {
    low: "Gates trust authorization changes and sequence-number bumps.",
    medium:
      "Gates everyday operations such as payments, offers, trustlines, account data, sponsorships, and contract calls.",
    high:
      "Gates account-control changes made with Set Options, including signer and threshold updates."
  } satisfies Record<ThresholdLevel, string>
} as const;

export const errorCopy: Record<
  AccountSignersErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter an account address",
    description: "Paste a Stellar public address starting with G to inspect its signers."
  },
  invalid_address: {
    title: "That is not a valid account address",
    description:
      "The value failed Stellar's public-key checksum check. Confirm it starts with G and was copied in full; never paste a secret key."
  },
  account_not_found: {
    title: "This account does not exist on the selected network",
    description:
      "Check the network switch in the header and the account address. An account only exists after it has been funded."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Wait a moment, then try inspecting the account again."
  },
  request_failed: {
    title: "Could not load this account from Horizon",
    description: "Check your connection and try again. If the problem continues, Horizon may be unavailable."
  }
};
