import { err, ok, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import { runHorizonRequest } from "@/core/horizon/request";
import type { StellarNetwork } from "@/core/network/types";
import {
  toNetworkComparisonErrorCode,
  toSingleNetworkErrorMessage
} from "@/features/network-comparison/lib/networkComparison.errors";
import type {
  AmountComparison,
  NetworkComparisonErrorCode,
  NetworkComparisonInput,
  NetworkComparisonResult,
  NetworkSnapshot,
  NetworkSnapshotSuccess,
  ProtocolComparison
} from "@/features/network-comparison/types";

/**
 * Queries Horizon root document and latest ledger for a network.
 *
 * @param network - Target Stellar network.
 * @param signal - Optional cancellation signal.
 * @returns Populated snapshot of the network state.
 */
export async function fetchNetworkSnapshot(
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<NetworkSnapshotSuccess> {
  const server = horizonServer(network);

  const [root, ledgers] = await Promise.all([
    runHorizonRequest(server.root(), { signal }),
    runHorizonRequest(server.ledgers().order("desc").limit(1).call(), { signal })
  ]);

  const ledger = ledgers.records?.[0];
  const observedAt = new Date().toISOString();

  return {
    status: "online",
    network,
    observedAt,
    ledgerSequence:
      typeof ledger?.sequence === "number"
        ? ledger.sequence
        : typeof root.history_latest_ledger === "number"
          ? root.history_latest_ledger
          : null,
    closedAt:
      typeof ledger?.closed_at === "string"
        ? ledger.closed_at
        : typeof root.history_latest_ledger_closed_at === "string"
          ? root.history_latest_ledger_closed_at
          : null,
    protocolVersion:
      typeof ledger?.protocol_version === "number"
        ? ledger.protocol_version
        : typeof root.current_protocol_version === "number"
          ? root.current_protocol_version
          : null,
    coreSupportedProtocolVersion:
      typeof root.core_supported_protocol_version === "number"
        ? root.core_supported_protocol_version
        : null,
    horizonVersion: typeof root.horizon_version === "string" ? root.horizon_version : null,
    coreVersion: typeof root.core_version === "string" ? root.core_version : null,
    baseFeeInStroops:
      ledger?.base_fee_in_stroops !== undefined && ledger?.base_fee_in_stroops !== null
        ? String(ledger.base_fee_in_stroops)
        : null,
    baseReserveInStroops:
      ledger?.base_reserve_in_stroops !== undefined && ledger?.base_reserve_in_stroops !== null
        ? String(ledger.base_reserve_in_stroops)
        : null,
    ingestLatestLedger:
      typeof root.ingest_latest_ledger === "number" ? root.ingest_latest_ledger : null,
    historyLatestLedger:
      typeof root.history_latest_ledger === "number" ? root.history_latest_ledger : null,
    coreLatestLedger:
      typeof root.core_latest_ledger === "number" ? root.core_latest_ledger : null,
    networkPassphrase:
      typeof root.network_passphrase === "string" ? root.network_passphrase : null
  };
}

/**
 * Evaluates protocol version differences between testnet and mainnet snapshots.
 *
 * @param testnet - Testnet snapshot.
 * @param mainnet - Mainnet snapshot.
 * @returns ProtocolComparison summary.
 */
export function compareProtocols(
  testnet: NetworkSnapshot,
  mainnet: NetworkSnapshot
): ProtocolComparison {
  const testnetProtocol = testnet.status === "online" ? testnet.protocolVersion : null;
  const mainnetProtocol = mainnet.status === "online" ? mainnet.protocolVersion : null;

  if (testnetProtocol !== null && mainnetProtocol !== null) {
    const hasDifference = testnetProtocol !== mainnetProtocol;
    const testnetAhead = testnetProtocol > mainnetProtocol;
    const differenceCount = Math.abs(testnetProtocol - mainnetProtocol);
    return { testnetProtocol, mainnetProtocol, hasDifference, testnetAhead, differenceCount };
  }

  return {
    testnetProtocol,
    mainnetProtocol,
    hasDifference: false,
    testnetAhead: false,
    differenceCount: 0
  };
}

/**
 * Computes difference between two stroop values using BigInt arithmetic.
 *
 * @param testnetStroops - Testnet amount in stroops.
 * @param mainnetStroops - Mainnet amount in stroops.
 * @returns AmountComparison summary.
 */
export function compareAmounts(
  testnetStroops: string | null,
  mainnetStroops: string | null
): AmountComparison {
  if (testnetStroops !== null && mainnetStroops !== null) {
    const t = BigInt(testnetStroops);
    const m = BigInt(mainnetStroops);
    const diff = t - m;
    return {
      testnetStroops,
      mainnetStroops,
      differenceStroops: diff.toString(),
      hasDifference: diff !== 0n
    };
  }

  return {
    testnetStroops,
    mainnetStroops,
    differenceStroops: null,
    hasDifference: false
  };
}

/**
 * Combines two network snapshots into a unified comparison result.
 *
 * @param testnet - Testnet snapshot.
 * @param mainnet - Mainnet snapshot.
 * @returns NetworkComparisonResult object.
 */
export function buildComparisonResult(
  testnet: NetworkSnapshot,
  mainnet: NetworkSnapshot
): NetworkComparisonResult {
  const testnetFee = testnet.status === "online" ? testnet.baseFeeInStroops : null;
  const mainnetFee = mainnet.status === "online" ? mainnet.baseFeeInStroops : null;
  const testnetReserve = testnet.status === "online" ? testnet.baseReserveInStroops : null;
  const mainnetReserve = mainnet.status === "online" ? mainnet.baseReserveInStroops : null;

  return {
    testnet,
    mainnet,
    protocolComparison: compareProtocols(testnet, mainnet),
    baseFeeComparison: compareAmounts(testnetFee, mainnetFee),
    baseReserveComparison: compareAmounts(testnetReserve, mainnetReserve),
    observedAt: new Date().toISOString()
  };
}

/**
 * Core tool logic. Queries both networks concurrently and builds a comparison.
 *
 * @param _input - Request input with timestamp.
 * @param signal - Optional AbortSignal.
 * @returns Result with comparison result or an error code.
 */
export async function runNetworkComparison(
  _input: NetworkComparisonInput,
  signal?: AbortSignal
): Promise<Result<NetworkComparisonResult, NetworkComparisonErrorCode, NetworkComparisonResult>> {
  if (signal?.aborted) return err("request_failed");

  try {
    const [testnetSettled, mainnetSettled] = await Promise.allSettled([
      fetchNetworkSnapshot("testnet", signal),
      fetchNetworkSnapshot("mainnet", signal)
    ]);

    if (signal?.aborted) return err("request_failed");

    const bothFailed =
      testnetSettled.status === "rejected" && mainnetSettled.status === "rejected";

    if (bothFailed) {
      return err("both_unreachable");
    }

    const testnetSnapshot: NetworkSnapshot =
      testnetSettled.status === "fulfilled"
        ? testnetSettled.value
        : {
            status: "unreachable",
            network: "testnet",
            error: toSingleNetworkErrorMessage(testnetSettled.reason)
          };

    const mainnetSnapshot: NetworkSnapshot =
      mainnetSettled.status === "fulfilled"
        ? mainnetSettled.value
        : {
            status: "unreachable",
            network: "mainnet",
            error: toSingleNetworkErrorMessage(mainnetSettled.reason)
          };

    const comparison = buildComparisonResult(testnetSnapshot, mainnetSnapshot);

    const isPartial =
      testnetSettled.status === "rejected" || mainnetSettled.status === "rejected";

    if (isPartial) {
      return err("partial_failure", comparison);
    }

    return ok(comparison);
  } catch (error) {
    return err(toNetworkComparisonErrorCode(error));
  }
}
