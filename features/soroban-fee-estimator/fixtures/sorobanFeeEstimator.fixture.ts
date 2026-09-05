import type { SorobanFeeEstimatorResult } from "@/features/soroban-fee-estimator/types";

// A deterministic testnet Soroban transaction envelope with declared resources.
export const validSorobanEnvelope =
  "AAAAAgAAAACKiOPddAnxlf1S2y08ul1yymcJvx2UEhvzdIgBtA9vXAABhqAAAAAAAAAAZQAAAAEAAAAAAAAAAAAAAABqmGhFAAAAAAAAAAEAAAAAAAAAAQAAAACKiOPddAnxlf1S2y08ul1yymcJvx2UEhvzdIgBtA9vXAAAAAAAAAAAAJiWgAAAAAEAAAAAAAAAAAAAAAAAAYagAAAEAAAAAgAAAAAAAADDUAAAAAA=";

// Same resources but a tiny declared resource fee to trigger a shortfall.
export const lowFeeSorobanEnvelope =
  "AAAAAgAAAACKiOPddAnxlf1S2y08ul1yymcJvx2UEhvzdIgBtA9vXAAAAGQAAAAAAAAAZQAAAAEAAAAAAAAAAAAAAABqmGhWAAAAAAAAAAEAAAAAAAAAAQAAAACKiOPddAnxlf1S2y08ul1yymcJvx2UEhvzdIgBtA9vXAAAAAAAAAAAAJiWgAAAAAEAAAAAAAAAAAAAAAAAAYagAAAEAAAAAgAAAAAAAAAACgAAAAA=";

export const sorobanFeeEstimatorFixture: SorobanFeeEstimatorResult = {
  network: "testnet",
  latestLedger: 1234567,
  declaredResourceFeeStroops: 50000n,
  inclusionFeeStroops: 210n,
  estimatedTotalStroops: 508710n,
  shortfallStroops: null,
  dominantComponent: "instructions",
  components: [
    { name: "instructions", count: 100000n, unitPriceStroops: 5000n, totalStroops: 5000n },
    { name: "ledger-read", count: 0n, unitPriceStroops: 625n, totalStroops: 1000n },
    { name: "ledger-write", count: 0n, unitPriceStroops: 2500n, totalStroops: 2000n },
    { name: "bandwidth", count: 188n, unitPriceStroops: 200n, totalStroops: 200n },
    { name: "rent", count: 512n, unitPriceStroops: 500n, totalStroops: 500n },
  ],
  resources: {
    instructions: 100000n,
    readEntries: 0n,
    writeEntries: 0n,
    readBytes: 1024n,
    writeBytes: 512n,
    extendedMetaDataSizeBytes: 0n,
    transactionSizeBytes: 188n,
  },
};
