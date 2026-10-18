import { samplePolicy } from "./sep7RequestPolicyAuditor.fixture";

export const openAssetPolicy = { ...samplePolicy, assets: [], memos: [] };
export const openAssetPolicyText = JSON.stringify(openAssetPolicy);
export const brokenPolicyText = "{destinations:";
export const emptyDestinationPolicyText = JSON.stringify({ ...samplePolicy, destinations: [] });
