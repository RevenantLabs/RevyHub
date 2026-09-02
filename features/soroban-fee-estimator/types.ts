export interface SorobanFeeEstimatorInput {
  envelope: string;
}

export interface FeeComponent {
  name: string;
  count: bigint;
  unitPriceStroops: bigint;
  totalStroops: bigint;
}

export interface SorobanFeeEstimatorResult {
  network: string;
  latestLedger: number;
  declaredResourceFeeStroops: bigint;
  inclusionFeeStroops: bigint;
  estimatedTotalStroops: bigint;
  shortfallStroops: bigint | null;
  components: FeeComponent[];
  dominantComponent: string;
  resources: {
    instructions: bigint;
    readEntries: bigint;
    writeEntries: bigint;
    readBytes: bigint;
    writeBytes: bigint;
    extendedMetaDataSizeBytes: bigint;
    transactionSizeBytes: bigint;
  };
}

export type SorobanFeeEstimatorErrorCode =
  | "empty_input"
  | "invalid_xdr"
  | "not_soroban"
  | "pricing_unavailable"
  | "rpc_error"
  | "request_failed";
