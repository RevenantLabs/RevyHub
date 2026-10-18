export type NetworkComparisonErrorCode = "both_unreachable" | "partial_failure" | "request_failed";
export interface NetworkComparisonInput { readonly compare: true }
export interface NetworkObservation {
 observedAt: string; ledger: number | null; protocol: number | null; coreLatest: number | null; historyLatest: number | null; lag: number | null;
 baseFee: string | null; baseReserve: string | null;
}
export type NetworkColumn = {ok:true; value:NetworkObservation} | {ok:false; code:"request_failed"};
export interface NetworkComparisonResult {
 testnet: NetworkColumn; mainnet: NetworkColumn; partial: boolean;
 protocolDiffers: boolean | null; feeDiffers: boolean | null; reserveDiffers: boolean | null;
}
