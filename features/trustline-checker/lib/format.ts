/** Horizon reports "no practical limit" as the maximum int64 in stroops. */
export const MAX_LIMIT = "922337203685.4775807";

export function formatLimit(limit: string): string {
  return limit === MAX_LIMIT ? "Maximum (no practical limit)" : limit;
}

export function formatAssetIdentity(assetCode: string, issuerId: string): string {
  return `${assetCode}:${issuerId}`;
}

export function describeAuthorization(
  authorized: boolean,
  maintainLiabilities: boolean
): string {
  if (authorized) return "Authorized";
  if (maintainLiabilities) return "Authorized to maintain liabilities only";
  return "Not authorized";
}
