import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode } from "../types";

function decodeEnvelope(raw: string): Result<xdr.TransactionEnvelope, ErrorCode, string[]> {
  try {
    return ok(xdr.TransactionEnvelope.fromXDR(raw, "base64"));
  } catch {
    return err("invalid_xdr");
  }
}

function operationsOf(decoded: xdr.TransactionEnvelope): Result<xdr.Operation[], ErrorCode, string[]> {
  switch (decoded.switch().name) {
    case "envelopeTypeTxV0":
      return ok(decoded.v0().tx().operations());
    case "envelopeTypeTx":
      return ok(decoded.v1().tx().operations());
    case "envelopeTypeTxFeeBump": {
      const inner = decoded.feeBump().tx().innerTx();
      if (inner.switch().name !== "envelopeTypeTx") return err("invalid_xdr");
      return ok(inner.v1().tx().operations());
    }
    default:
      return err("invalid_xdr");
  }
}

export interface DecodedHostFunction {
  isV2: boolean;
  contractIdPreimage: xdr.ContractIdPreimage;
  executable: xdr.ContractExecutable;
  constructorArgs: xdr.ScVal[];
}

/**
 * Decodes the envelope and finds the first contract-creation host function
 * among its operations (`CreateContractArgs` or `CreateContractArgsV2`).
 *
 * When no such operation exists, the `no_create_contract_operation` error
 * carries the operation type names that *were* found, as detail — so the UI
 * can show what the envelope actually contains instead of just "not found".
 */
export function findCreateContractHostFunction(
  raw: string
): Result<DecodedHostFunction, ErrorCode, string[]> {
  const decoded = decodeEnvelope(raw);
  if (!decoded.ok) return decoded;

  const operations = operationsOf(decoded.value);
  if (!operations.ok) return operations;

  const operationTypes: string[] = [];

  try {
    for (const operation of operations.value) {
      const body = operation.body();
      const typeName = body.switch().name;
      operationTypes.push(typeName);

      if (typeName !== "invokeHostFunction") continue;

      const hostFunction = body.invokeHostFunctionOp().hostFunction();
      const name = hostFunction.switch().name;

      if (name === "hostFunctionTypeCreateContract") {
        const args = hostFunction.createContract();
        return ok({
          isV2: false,
          contractIdPreimage: args.contractIdPreimage(),
          executable: args.executable(),
          constructorArgs: []
        });
      }

      if (name === "hostFunctionTypeCreateContractV2") {
        const args = hostFunction.createContractV2();
        return ok({
          isV2: true,
          contractIdPreimage: args.contractIdPreimage(),
          executable: args.executable(),
          constructorArgs: args.constructorArgs()
        });
      }
    }
  } catch {
    return err("invalid_xdr");
  }

  return err("no_create_contract_operation", operationTypes);
}
