import type { AssetDescriptorErrorCode } from "@/features/asset-descriptor-codec/types";

export const copy = {
  formLabel: "Asset descriptor or XDR",
  formHint:
    'Enter XLM, an asset code and issuer (e.g. USDC:GABC...), or a raw Asset XDR base64 string.',
  submit: "Convert",
  loading: "Converting...",
  emptyTitle: "No asset converted yet",
  emptyDescription:
    "Enter an asset descriptor or XDR to see its canonical text, JSON, and XDR representations.",
  resultTitle: "Asset Representation",
  canonicalLabel: "Canonical",
  jsonLabel: "Structured JSON",
  xdrLabel: "Asset XDR (base64)",
  kindLabel: "Asset Type",
  codeLabel: "Asset Code",
  issuerLabel: "Issuer",
  decodeTab: "Decode XDR",
  encodeTab: "Encode Descriptor",
  encodeDescription: "Convert a human-readable asset descriptor to all representations.",
  decodeDescription: "Decode a raw Asset XDR back into readable form.",
  copyJsonButton: "Copy JSON",
  copyXdrButton: "Copy XDR",
  copied: "Copied!",
  assetType: "Asset Type",
} as const;

export const errorCopy: Record<
  AssetDescriptorErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter an asset descriptor or XDR",
    description: "Paste XLM, CODE:ISSUER, or a base64 Asset XDR string.",
  },
  invalid_asset_code: {
    title: "That asset code is not valid",
    description:
      "Asset codes must be 1-12 alphanumeric characters. Check the code and try again.",
  },
  invalid_issuer: {
    title: "That issuer address is not valid",
    description:
      "The issuer must be a valid Stellar address starting with G. Confirm it was copied in full.",
  },
  invalid_xdr: {
    title: "That is not a valid Asset XDR",
    description:
      "The XDR could not be decoded. Ensure it is a base64-encoded Stellar Asset XDR.",
  },
  unsupported_asset_type: {
    title: "This asset type is not supported",
    description: "Only native and credit assets are currently supported.",
  },
};
