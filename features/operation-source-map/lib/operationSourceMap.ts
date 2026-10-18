import {
  decodeAddressToMuxedAccount,
  encodeMuxedAccountToAddress,
  extractBaseAddress,
  StrKey,
  xdr
} from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  AccountIdentity,
  EnvelopeKind,
  OperationSource,
  SourceGroup,
  SourceMap,
  SourceMapErrorCode,
  SourceMapInput
} from "@/features/operation-source-map/types";

/**
 * Keeps the exact address the envelope carries and reports the underlying
 * `G…` account beside it.
 *
 * Collapsing an `M…` address to its base account would hide the muxed ID and,
 * worse, silently merge two distinct sources into one group.
 */
export function describeAccount(address: string): AccountIdentity {
  if (!address.startsWith("M")) {
    return { address, baseAddress: null, muxedId: null };
  }

  try {
    const muxed = decodeAddressToMuxedAccount(address, true);
    return {
      address,
      baseAddress: extractBaseAddress(address),
      muxedId: muxed.med25519().id().toString()
    };
  } catch {
    return { address, baseAddress: null, muxedId: null };
  }
}

function describeMuxed(account: xdr.MuxedAccount): AccountIdentity {
  return describeAccount(encodeMuxedAccountToAddress(account, true));
}

/**
 * Maps the operations vector against the transaction source.
 *
 * `sourceAccount()` on an operation is optional in XDR: when it is absent the
 * operation inherits. That absence is the whole subject of this tool, so it is
 * recorded explicitly rather than being resolved away.
 */
export function mapOperations(
  operations: xdr.Operation[],
  transactionSource: AccountIdentity
): OperationSource[] {
  return operations.map((operation, index) => {
    const declared = operation.sourceAccount();
    const explicitSource = declared ? describeMuxed(declared) : null;

    return {
      index,
      type: operation.body().switch().name,
      explicitSource,
      effectiveSource: explicitSource ?? transactionSource,
      inherited: explicitSource === null
    };
  });
}

/**
 * Groups by the exact effective address, in first-appearance order.
 *
 * Ordering by appearance rather than alphabetically keeps the groups aligned
 * with the envelope a reader is looking at, and makes the output stable for
 * the JSON export.
 */
export function groupBySource(operations: OperationSource[]): SourceGroup[] {
  const groups = new Map<string, SourceGroup>();

  for (const operation of operations) {
    const key = operation.effectiveSource.address;
    const existing = groups.get(key);

    if (existing) {
      existing.operationIndexes.push(operation.index);
      if (operation.inherited) existing.inheritedCount += 1;
      else existing.overriddenCount += 1;
      continue;
    }

    groups.set(key, {
      source: operation.effectiveSource,
      operationIndexes: [operation.index],
      inheritedCount: operation.inherited ? 1 : 0,
      overriddenCount: operation.inherited ? 0 : 1
    });
  }

  return [...groups.values()];
}

function buildMap(
  kind: EnvelopeKind,
  transactionSource: AccountIdentity,
  feePayer: AccountIdentity | null,
  operations: xdr.Operation[]
): SourceMap {
  const mapped = mapOperations(operations, transactionSource);

  return {
    kind,
    transactionSource,
    feePayer,
    operations: mapped,
    groups: groupBySource(mapped),
    inheritedCount: mapped.filter((operation) => operation.inherited).length,
    overriddenCount: mapped.filter((operation) => !operation.inherited).length
  };
}

/**
 * Builds the source map entirely in-process.
 *
 * For a fee-bump envelope the *inner* transaction supplies the default source:
 * the operations belong to it, and the fee source pays without authorizing
 * anything. Reporting the fee source as the inherited default would be the
 * single most misleading thing this tool could do, so it is carried in its own
 * field and excluded from the groups.
 */
export function buildSourceMap({
  envelope
}: SourceMapInput): Result<SourceMap, SourceMapErrorCode> {
  let decoded: xdr.TransactionEnvelope;

  try {
    decoded = xdr.TransactionEnvelope.fromXDR(envelope, "base64");
  } catch {
    return err("invalid_xdr");
  }

  try {
    switch (decoded.switch().name) {
      case "envelopeTypeTxV0": {
        const tx = decoded.v0().tx();
        const source = describeAccount(
          StrKey.encodeEd25519PublicKey(tx.sourceAccountEd25519())
        );
        return ok(buildMap("classic-v0", source, null, tx.operations()));
      }

      case "envelopeTypeTx": {
        const tx = decoded.v1().tx();
        return ok(
          buildMap("classic-v1", describeMuxed(tx.sourceAccount()), null, tx.operations())
        );
      }

      case "envelopeTypeTxFeeBump": {
        const feeBumpTx = decoded.feeBump().tx();
        const innerTx = feeBumpTx.innerTx();

        if (innerTx.switch().name !== "envelopeTypeTx") return err("unsupported_envelope");

        const inner = innerTx.v1().tx();
        return ok(
          buildMap(
            "fee-bump",
            describeMuxed(inner.sourceAccount()),
            describeMuxed(feeBumpTx.feeSource()),
            inner.operations()
          )
        );
      }

      default:
        return err("unsupported_envelope");
    }
  } catch {
    // The envelope decoded but a field could not be normalised for display.
    return err("invalid_xdr");
  }
}

/**
 * A deterministic JSON summary.
 *
 * Key order is fixed by the object literals below rather than by iteration
 * order, and no timestamp or environment value is included, so the same
 * envelope always produces byte-identical output.
 */
export function toJsonSummary(map: SourceMap): string {
  return JSON.stringify(
    {
      envelopeKind: map.kind,
      transactionSource: map.transactionSource.address,
      feePayer: map.feePayer?.address ?? null,
      inheritedCount: map.inheritedCount,
      overriddenCount: map.overriddenCount,
      operations: map.operations.map((operation) => ({
        index: operation.index,
        type: operation.type,
        explicitSource: operation.explicitSource?.address ?? null,
        effectiveSource: operation.effectiveSource.address,
        inherited: operation.inherited
      })),
      groups: map.groups.map((group) => ({
        source: group.source.address,
        baseAccount: group.source.baseAddress,
        operationIndexes: group.operationIndexes,
        inheritedCount: group.inheritedCount,
        overriddenCount: group.overriddenCount
      }))
    },
    null,
    2
  );
}
