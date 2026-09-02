import { StrKey, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { sorobanRpc, isRpcFailure } from "@/core/rpc/client";
import type { StellarNetwork } from "@/core/network/types";
import { toSimulationExplainerErrorCode } from "@/features/simulation-explainer/lib/simulationExplainer.errors";
import type {
  SimulationAuthEntry,
  SimulationExplainerErrorCode,
  SimulationExplainerInput,
  SimulationExplainerResult,
  SimulationResourceUsage,
  SimulationSuccess
} from "@/features/simulation-explainer/types";

interface SimulateTransactionRpcResult {
  transactionData?: string;
  events?: string[];
  minResourceFee?: string;
  results?: {
    auth?: string[];
    xdr?: string;
  }[];
  cost?: {
    cpuInsns: string;
    memBytes: string;
  };
  latestLedger: number;
  restorePreamble?: {
    minResourceFee: string;
    transactionData: string;
  };
  error?: {
    code: string | number;
    message: string;
    data?: unknown;
  };
}

const BASE_FEE_STROOPS = "100";

/**
 * Simulates a pasted Soroban transaction envelope against the selected RPC node
 * and turns the response into a user-facing explanation.
 *
 * A failed simulation is still a successful RPC call — the contract's error is
 * surfaced, not mapped to a generic code.
 */
export async function runSimulationExplainer(
  { xdr: envelopeXdr }: SimulationExplainerInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<SimulationExplainerResult, SimulationExplainerErrorCode>> {
  try {
    const response = await sorobanRpc<SimulateTransactionRpcResult>(
      "simulateTransaction",
      { transaction: envelopeXdr },
      { network, signal }
    );

    if (isRpcFailure(response)) return err("rpc_error");

    const result = response.result;

    if (result.error) {
      return ok({
        kind: "failure",
        errorCode: String(result.error.code),
        errorMessage: result.error.message
      });
    }

    if (result.restorePreamble) {
      return ok({
        kind: "restore",
        minResourceFee: result.restorePreamble.minResourceFee,
        latestLedger: result.latestLedger
      });
    }

    return parseSuccess(result);
  } catch (error) {
    if (signal?.aborted) return err("request_failed");
    return err(toSimulationExplainerErrorCode(error));
  }
}

function parseSuccess(
  result: SimulateTransactionRpcResult
): Result<SimulationExplainerResult, SimulationExplainerErrorCode> {
  const resources = parseResources(result.transactionData);
  if (!resources) return err("simulation_failed");

  const authEntries: SimulationAuthEntry[] = [];
  const returnValues: string[] = [];

  for (const item of result.results ?? []) {
    if (item.xdr) returnValues.push(item.xdr);
    for (const authXdr of item.auth ?? []) {
      const entry = parseAuthEntry(authXdr);
      if (entry) authEntries.push(entry);
    }
  }

  const success: SimulationSuccess = {
    kind: "success",
    latestLedger: result.latestLedger,
    minResourceFee: result.minResourceFee ?? "0",
    baseFee: BASE_FEE_STROOPS,
    resources,
    authEntries,
    returnValue: returnValues[0] ?? null,
    events: result.events ?? []
  };

  return ok(success);
}

function parseResources(transactionDataXdr: string | undefined): SimulationResourceUsage | null {
  if (!transactionDataXdr) return null;

  try {
    const data = xdr.SorobanTransactionData.fromXDR(transactionDataXdr, "base64");
    const resources = data.resources();
    const footprint = resources.footprint();

    return {
      cpuInstructions: String(resources.instructions()),
      memoryBytes: "0",
      readBytes: String(resources.readBytes()),
      writeBytes: String(resources.writeBytes()),
      ledgerReadEntries: footprint.readOnly().length,
      ledgerWriteEntries: footprint.readWrite().length,
      ledgerEntryReadBytes: String(resources.readBytes()),
      ledgerEntryWriteBytes: String(resources.writeBytes())
    };
  } catch {
    return null;
  }
}

function parseAuthEntry(authXdr: string): SimulationAuthEntry | null {
  try {
    const entry = xdr.SorobanAuthorizationEntry.fromXDR(authXdr, "base64");
    const credentials = entry.credentials();
    const credentialsType = credentials.switch();

    let accountId: string | null = null;
    let contractId: string | null = null;
    let nonce: string | null = null;
    const signatureArgs: string[] = [];

    if (credentialsType.value === xdr.SorobanCredentialsType.sorobanCredentialsAddress().value) {
      const addressCredentials = credentials.address();
      nonce = addressCredentials.nonce().toString();

      const address = addressCredentials.address();
      const addressType = address.switch();

      if (addressType.value === xdr.ScAddressType.scAddressTypeAccount().value) {
        accountId = StrKey.encodeEd25519PublicKey(address.accountId().ed25519());
      } else if (addressType.value === xdr.ScAddressType.scAddressTypeContract().value) {
        contractId = StrKey.encodeContract(address.contractId());
      }

      const signature = addressCredentials.signature();
      const signatureVec = signature.vec();
      if (signatureVec) {
        for (const scVal of signatureVec) {
          signatureArgs.push(scVal.toXDR("base64"));
        }
      }
    }

    return { accountId, contractId, nonce, signatureArgs };
  } catch {
    return null;
  }
}
