import { TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { isRpcFailure, sorobanRpc } from "@/core/rpc/client";
import { toSorobanFeeEstimatorErrorCode } from "@/features/soroban-fee-estimator/lib/sorobanFeeEstimator.errors";
import type { StellarNetwork } from "@/core/network/types";
import type {
  SorobanFeeEstimatorInput,
  SorobanFeeEstimatorResult,
  SorobanFeeEstimatorErrorCode,
  FeeComponent,
} from "@/features/soroban-fee-estimator/types";

// Approximate fee rates used when the RPC does not expose the on-chain
// ConfigSetting fee schedule directly. These are documented in the UI so
// users understand the estimate is approximate.
const FEE_RATES = {
  instructionIncrement: 5000n, // per 100k instructions
  instructionUnit: 100_000n,
  readEntry: 625n,
  writeEntry: 2_500n,
  readKilobyte: 1_000n,
  writeKilobyte: 4_000n,
  metadataKilobyte: 500n,
  bandwidthKilobyte: 200n,
} as const;

export interface ParsedSorobanResources {
  instructions: bigint;
  readEntries: bigint;
  writeEntries: bigint;
  readBytes: bigint;
  writeBytes: bigint;
  transactionSizeBytes: bigint;
  declaredResourceFeeStroops: bigint;
}

function divCeil(a: bigint, b: bigint): bigint {
  if (b <= 0n) return 0n;
  return (a + b - 1n) / b;
}

function parseStroops(value: string | number | bigint | undefined): bigint {
  if (value === undefined || value === null) return 0n;
  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
}

interface TransactionEnvelope {
  _tx?: xdr.Transaction;
  toXDR: () => string;
}

function getSorobanData(
  tx: TransactionEnvelope
): xdr.SorobanTransactionData | undefined {
  const xdrTx = tx._tx;
  if (!xdrTx) return undefined;
  return xdrTx.ext().sorobanData?.();
}

/**
 * Decodes a base64 transaction envelope and extracts Soroban resources.
 * Returns "not_soroban" when the envelope has no SorobanTransactionData.
 */
export function extractSorobanResources(
  envelopeXdr: string
): Result<ParsedSorobanResources, SorobanFeeEstimatorErrorCode> {
  let tx: TransactionEnvelope;
  try {
    tx = TransactionBuilder.fromXDR(envelopeXdr, "PUBLIC") as unknown as TransactionEnvelope;
  } catch {
    try {
      tx = TransactionBuilder.fromXDR(envelopeXdr, "TESTNET") as unknown as TransactionEnvelope;
    } catch {
      return err("invalid_xdr");
    }
  }

  const sorobanData = getSorobanData(tx);
  if (!sorobanData) return err("not_soroban");

  const resources = sorobanData.resources();
  const footprint = resources.footprint();
  const transactionSizeBytes = BigInt(Buffer.from(tx.toXDR(), "base64").length);

  return ok({
    instructions: BigInt(resources.instructions()),
    readEntries: BigInt(footprint.readOnly().length),
    writeEntries: BigInt(footprint.readWrite().length),
    readBytes: BigInt(resources.readBytes()),
    writeBytes: BigInt(resources.writeBytes()),
    transactionSizeBytes,
    declaredResourceFeeStroops: parseStroops(sorobanData.resourceFee().toString()),
  });
}

interface FeeStatsResponse {
  sorobanInclusionFee: {
    p50: string;
  };
  latestLedger: number;
}

async function fetchFeeStats(
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<FeeStatsResponse, SorobanFeeEstimatorErrorCode>> {
  try {
    const response = await sorobanRpc<FeeStatsResponse>("getFeeStats", {}, { network, signal });
    if (isRpcFailure(response)) {
      return err("rpc_error");
    }
    if (!response.result?.sorobanInclusionFee?.p50) {
      return err("pricing_unavailable");
    }
    return ok(response.result);
  } catch (error) {
    return err(toSorobanFeeEstimatorErrorCode(error));
  }
}

function computeFeeBreakdown(
  resources: ParsedSorobanResources
): { components: FeeComponent[]; totalResourceFee: bigint } {
  const instructionUnits = divCeil(resources.instructions, FEE_RATES.instructionUnit);
  const readKb = divCeil(resources.readBytes, 1024n);
  const writeKb = divCeil(resources.writeBytes, 1024n);
  const bandwidthKb = divCeil(resources.transactionSizeBytes, 1024n);

  const components: FeeComponent[] = [
    {
      name: "instructions",
      count: resources.instructions,
      unitPriceStroops: FEE_RATES.instructionIncrement,
      totalStroops: instructionUnits * FEE_RATES.instructionIncrement,
    },
    {
      name: "ledger-read",
      count: resources.readEntries,
      unitPriceStroops: FEE_RATES.readEntry,
      totalStroops: resources.readEntries * FEE_RATES.readEntry + readKb * FEE_RATES.readKilobyte,
    },
    {
      name: "ledger-write",
      count: resources.writeEntries,
      unitPriceStroops: FEE_RATES.writeEntry,
      totalStroops: resources.writeEntries * FEE_RATES.writeEntry + writeKb * FEE_RATES.writeKilobyte,
    },
    {
      name: "bandwidth",
      count: resources.transactionSizeBytes,
      unitPriceStroops: FEE_RATES.bandwidthKilobyte,
      totalStroops: bandwidthKb * FEE_RATES.bandwidthKilobyte,
    },
    {
      name: "rent",
      count: resources.writeBytes,
      unitPriceStroops: FEE_RATES.metadataKilobyte,
      totalStroops: writeKb * FEE_RATES.metadataKilobyte,
    },
  ];

  const totalResourceFee = components.reduce((sum, c) => sum + c.totalStroops, 0n);
  return { components, totalResourceFee };
}

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runSorobanFeeEstimator(
  input: SorobanFeeEstimatorInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<SorobanFeeEstimatorResult, SorobanFeeEstimatorErrorCode>> {
  const resourcesResult = extractSorobanResources(input.envelope);
  if (!resourcesResult.ok) return resourcesResult;
  const resources = resourcesResult.value;

  const statsResult = await fetchFeeStats(network, signal);
  if (!statsResult.ok) return statsResult;
  const stats = statsResult.value;

  const inclusionFeeStroops = parseStroops(stats.sorobanInclusionFee.p50);
  const { components, totalResourceFee } = computeFeeBreakdown(resources);

  const shortfallStroops =
    resources.declaredResourceFeeStroops < totalResourceFee
      ? totalResourceFee - resources.declaredResourceFeeStroops
      : null;

  const dominantComponent = components.reduce((max, c) =>
    c.totalStroops > max.totalStroops ? c : max
  ).name;

  return ok({
    network,
    latestLedger: stats.latestLedger,
    declaredResourceFeeStroops: resources.declaredResourceFeeStroops,
    inclusionFeeStroops,
    estimatedTotalStroops: totalResourceFee + inclusionFeeStroops,
    shortfallStroops,
    components,
    dominantComponent,
    resources: {
      instructions: resources.instructions,
      readEntries: resources.readEntries,
      writeEntries: resources.writeEntries,
      readBytes: resources.readBytes,
      writeBytes: resources.writeBytes,
      extendedMetaDataSizeBytes: 0n,
      transactionSizeBytes: resources.transactionSizeBytes,
    },
  });
}
