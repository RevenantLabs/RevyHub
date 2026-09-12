import type { StellarNetwork } from "@/core/network/types";

/** Input payload for requesting a network comparison refresh. */
export interface NetworkComparisonInput {
  refreshedAt: number;
}

/** Error codes defined by the feature contract. */
export type NetworkComparisonErrorCode =
  | "both_unreachable"
  | "partial_failure"
  | "request_failed";

/** Successful snapshot of a single network endpoint. */
export interface NetworkSnapshotSuccess {
  readonly status: "online";
  readonly network: StellarNetwork;
  readonly observedAt: string;
  readonly ledgerSequence: number | null;
  readonly closedAt: string | null;
  readonly protocolVersion: number | null;
  readonly coreSupportedProtocolVersion: number | null;
  readonly horizonVersion: string | null;
  readonly coreVersion: string | null;
  readonly baseFeeInStroops: string | null;
  readonly baseReserveInStroops: string | null;
  readonly ingestLatestLedger: number | null;
  readonly historyLatestLedger: number | null;
  readonly coreLatestLedger: number | null;
  readonly networkPassphrase: string | null;
}

/** Failed snapshot of a single network endpoint. */
export interface NetworkSnapshotFailure {
  readonly status: "unreachable";
  readonly network: StellarNetwork;
  readonly error: string;
}

export type NetworkSnapshot = NetworkSnapshotSuccess | NetworkSnapshotFailure;

/** Comparison between protocol versions of testnet and mainnet. */
export interface ProtocolComparison {
  readonly testnetProtocol: number | null;
  readonly mainnetProtocol: number | null;
  readonly hasDifference: boolean;
  readonly testnetAhead: boolean;
  readonly differenceCount: number;
}

/** Comparison between numerical fee or reserve amounts. */
export interface AmountComparison {
  readonly testnetStroops: string | null;
  readonly mainnetStroops: string | null;
  readonly differenceStroops: string | null;
  readonly hasDifference: boolean;
}

/** Aggregated comparison data between testnet and mainnet. */
export interface NetworkComparisonResult {
  readonly testnet: NetworkSnapshot;
  readonly mainnet: NetworkSnapshot;
  readonly protocolComparison: ProtocolComparison;
  readonly baseFeeComparison: AmountComparison;
  readonly baseReserveComparison: AmountComparison;
  readonly observedAt: string;
}
