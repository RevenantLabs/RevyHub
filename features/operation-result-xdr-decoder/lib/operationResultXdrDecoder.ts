import { err, ok, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import type { OperationResultXdrDecoderInput, OperationResultXdrDecoderResult, OperationResultXdrDecoderErrorCode } from "../types";
import { decodeTransactionResultXdr } from "./result-xdr-decode";
import { pairOperationResults } from "./operation-result-pairing";
import { explainCode } from "./format";
import { toOperationResultXdrDecoderErrorCode } from "./operationResultXdrDecoder.errors";
import { parseOperationResultXdrDecoderInput } from "../schema";

export async function runOperationResultXdrDecoder(input: OperationResultXdrDecoderInput, network: StellarNetwork): Promise<Result<OperationResultXdrDecoderResult, OperationResultXdrDecoderErrorCode>> {
  // The domain entry point is also used without the form. Reject invalid hashes before Horizon sees them.
  const parsed = parseOperationResultXdrDecoderInput(input.hash);
  if (!parsed.ok) return parsed;
  const hash = parsed.value.hash;
  try {
    const server = horizonServer(network);
    const tx = await server.transactions().transaction(hash).call();
    const decoded = decodeTransactionResultXdr((tx as { result_xdr?: unknown }).result_xdr);
    if (!decoded.ok) return decoded;
    let types: string[] = [];
    if (decoded.value.operations.length) {
      const page = await server.operations().forTransaction(hash).includeFailed(true).order("asc").limit(200).call();
      types = page.records.map((record) => record.type);
      // Horizon pages at 200. Complete pairing is mandatory even for larger transactions.
      let next = page;
      while (next.records.length === 200 && types.length < decoded.value.operations.length) {
        next = await next.next();
        types.push(...next.records.map((record) => record.type));
      }
    }
    const paired = pairOperationResults(decoded.value.operations, types);
    if (!paired.ok) return paired;
    const verdict = decoded.value.transactionCode === "tx_success" ? "success" : decoded.value.operations.length ? "operation_failure" : "pre_operation_failure";
    return ok({ hash, network, verdict, outer: explainCode(decoded.value.outerCode), transaction: explainCode(decoded.value.transactionCode), feeCharged: decoded.value.feeCharged, innerFeeCharged: decoded.value.innerFeeCharged, feeBump: decoded.value.feeBump, operations: paired.value });
  } catch (error) { return err(toOperationResultXdrDecoderErrorCode(error)); }
}
