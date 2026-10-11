import type { HorizonUrlErrorCode } from "@/features/horizon-url-builder/types";

export const copy = {
  formLabel: "Resource",
  formHint: "Select a Horizon REST API resource and configure query parameters.",
  submit: "Build URL",
  loading: "Building...",
  emptyTitle: "No URL built yet",
  emptyDescription: "Select a Horizon resource and configure parameters to build a REST API URL.",
  resultTitle: "Built URL",
  resourceLabel: "Resource",
  networkLabel: "Network",
  paramsLabel: "Query Parameters",
  copyUrl: "Copy URL",
  copied: "Copied!",
} as const;

export const errorCopy: Record<
  HorizonUrlErrorCode,
  { title: string; description: string }
> = {
  empty_input: { title: "Select a resource", description: "Choose a Horizon REST API resource." },
  invalid_resource: { title: "Invalid resource", description: "Select a valid Horizon resource." },
  invalid_network: { title: "Invalid network", description: "Select mainnet or testnet." },
};
