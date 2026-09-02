import { StrKey, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  AuthCredentials,
  AuthEntry,
  AuthInvocationNode,
  SorobanAuthInspectorErrorCode,
  SorobanAuthInspectorInput,
  SorobanAuthInspectorResult
} from "@/features/soroban-auth-inspector/types";

export function runSorobanAuthInspector({
  xdr: envelopeXdr
}: SorobanAuthInspectorInput): Result<SorobanAuthInspectorResult, SorobanAuthInspectorErrorCode> {
  let envelope: xdr.TransactionEnvelope;

  try {
    envelope = xdr.TransactionEnvelope.fromXDR(envelopeXdr, "base64");
  } catch {
    return err("invalid_xdr");
  }

  const operations = extractOperations(envelope);
  if (!operations) return err("invalid_xdr");

  const invokeOp = findInvokeHostFunctionOp(operations);
  if (!invokeOp) return err("not_soroban");

  const authEntries = invokeOp.auth();
  if (!authEntries || authEntries.length === 0) {
    return ok({ kind: "no_authorization" });
  }

  const entries: AuthEntry[] = [];
  for (const authXdr of authEntries) {
    const entry = parseAuthEntry(authXdr);
    if (!entry) return err("auth_unreadable");
    entries.push(entry);
  }

  return ok({ kind: "auth", entries });
}

function extractOperations(envelope: xdr.TransactionEnvelope): xdr.Operation[] | null {
  try {
    switch (envelope.switch().name) {
      case "envelopeTypeTxV0":
        return envelope.v0().tx().operations();
      case "envelopeTypeTx":
        return envelope.v1().tx().operations();
      case "envelopeTypeTxFeeBump": {
        const inner = envelope.feeBump().tx().innerTx();
        if (inner.switch().name === "envelopeTypeTx") {
          return inner.v1().tx().operations();
        }
        return null;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function findInvokeHostFunctionOp(operations: xdr.Operation[]): xdr.InvokeHostFunctionOp | null {
  for (const operation of operations) {
    const body = operation.body();
    if (body.switch().name === "invokeHostFunction") {
      return body.invokeHostFunctionOp();
    }
  }
  return null;
}

function parseAuthEntry(auth: xdr.SorobanAuthorizationEntry): AuthEntry | null {
  try {
    const credentials = parseCredentials(auth.credentials());
    const rootInvocation = parseInvocation(auth.rootInvocation());
    if (!rootInvocation) return null;

    return { credentials, rootInvocation };
  } catch {
    return null;
  }
}

function parseCredentials(credentials: xdr.SorobanCredentials): AuthCredentials {
  const switchName = credentials.switch().name;

  if (switchName === "sorobanCredentialsSourceAccount") {
    return { kind: "sourceAccount" };
  }

  const addressCredentials = credentials.address();
  const address = addressCredentials.address();
  const addressType = address.switch().name;

  let accountId: string | null = null;
  let contractId: string | null = null;

  if (addressType === "scAddressTypeAccount") {
    accountId = StrKey.encodeEd25519PublicKey(address.accountId().ed25519());
  } else if (addressType === "scAddressTypeContract") {
    contractId = StrKey.encodeContract(address.contractId());
  }

  return {
    kind: "address",
    accountId,
    contractId,
    nonce: addressCredentials.nonce().toString(),
    signatureExpirationLedger: addressCredentials.signatureExpirationLedger()
  };
}

function parseInvocation(
  invocation: xdr.SorobanAuthorizedInvocation
): AuthInvocationNode | null {
  try {
    const functionNode = parseAuthorizedFunction(invocation.function());
    if (!functionNode) return null;

    const subInvocations: AuthInvocationNode[] = [];
    for (const sub of invocation.subInvocations()) {
      const parsed = parseInvocation(sub);
      if (parsed) subInvocations.push(parsed);
    }

    return { ...functionNode, subInvocations };
  } catch {
    return null;
  }
}

function parseAuthorizedFunction(
  fn: xdr.SorobanAuthorizedFunction
): Omit<AuthInvocationNode, "subInvocations"> | null {
  const switchName = fn.switch().name;

  if (switchName !== "sorobanAuthorizedFunctionTypeContractFn") {
    // Create-contract authorizations are not contract invocations.
    return { contractId: null, functionName: switchName, args: [] };
  }

  const contractFn = fn.contractFn();
  const address = contractFn.contractAddress();
  let contractId: string | null = null;

  if (address.switch().name === "scAddressTypeContract") {
    contractId = StrKey.encodeContract(address.contractId());
  }

  return {
    contractId,
    functionName: contractFn.functionName().toString(),
    args: contractFn.args().map((arg) => arg.toXDR("base64"))
  };
}
