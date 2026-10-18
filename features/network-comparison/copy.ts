import type { NetworkComparisonErrorCode } from "./types";
export const copy = {
 submit:"Compare networks",loading:"Checking both networks…",reset:"Reset",formHint:"Always compares the configured testnet and mainnet endpoints. The header network switch does not change this comparison.",
 emptyTitle:"Compare two independent networks",emptyDescription:"Inspect observed protocol versions, fees, reserves and ingestion state side by side.",resultTitle:"Network comparison",
 testnet:"Testnet",mainnet:"Mainnet",unavailable:"Unavailable",observedAt:"Observed at (UTC)",ledger:"Observed latest ledger",protocol:"Protocol version",baseFee:"Base fee (stroops)",baseReserve:"Base reserve (stroops)",coreLatest:"Core latest ledger",historyLatest:"Horizon ingested ledger",lag:"Ingestion lag (ledgers)",
 protocolDiffers:"Protocol versions differ",feeDiffers:"Base fees differ",reserveDiffers:"Base reserves differ",sameProtocol:"Observed protocol versions match",unknownProtocol:"Protocol comparison unavailable",
 resetNotice:"Testnet resets periodically. Accounts, transactions and contract data from before a reset may no longer exist; fund and recreate test resources as needed.",
 independence:"Ledger heights belong to separate networks and are never subtracted across networks. These are separate observations, not an atomic cross-network snapshot. Missing fields are unavailable, not zero."
} as const;
export const errorCopy: Record<NetworkComparisonErrorCode,{title:string;description:string}> = {
 both_unreachable:{title:"Neither network could be read",description:"Check your connection, wait and retry both configured Horizon providers."},
 partial_failure:{title:"One network could not be read",description:"The available column is preserved. Retry to update the failed network."},
 request_failed:{title:"Network observation unavailable",description:"The provider failed, returned malformed data or exceeded ten seconds. Retry the comparison."}
};
