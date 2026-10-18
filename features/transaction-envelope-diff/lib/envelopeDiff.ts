import {
  FeeBumpTransaction,
  Operation,
  Transaction,
  TransactionBuilder,
  xdr
} from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  DiffEntry,
  DiffErrorCode,
  DiffInput,
  DiffLayer,
  DiffSection,
  DiffSummary,
  EnvelopeKind,
  FieldMap,
  FieldValue
} from "@/features/transaction-envelope-diff/types";

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function set(
  map: FieldMap,
  path: string,
  value: string,
  section: DiffSection,
  layer: DiffLayer
): void {
  map.set(path, { value, section, layer });
}

/**
 * Flattens an arbitrary SDK value into dotted field paths.
 *
 * Values are stringified, never coerced with `Number`. Stellar amounts arrive
 * from the SDK as decimal strings and sequence numbers as integer strings;
 * passing either through `Number` would round exactly the digits a reviewer is
 * checking.
 */
export function flattenValue(
  path: string,
  value: unknown,
  section: DiffSection,
  layer: DiffLayer,
  out: FieldMap
): void {
  if (value === null || value === undefined) return;

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    set(out, path, String(value), section, layer);
    return;
  }

  if (value instanceof Uint8Array) {
    set(out, path, toHex(value), section, layer);
    return;
  }

  if (Array.isArray(value)) {
    set(out, `${path}.length`, String(value.length), section, layer);
    value.forEach((item, index) => flattenValue(`${path}[${index}]`, item, section, layer, out));
    return;
  }

  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value) as object | null;
    const stringify = (value as { toString?: unknown }).toString;

    // SDK value objects — Asset, Claimant, LiquidityPoolAsset — know how to
    // name themselves, and their own rendering is more useful than their
    // internals ("USDC:GA…" rather than four nested fields).
    if (
      prototype &&
      prototype !== Object.prototype &&
      typeof stringify === "function" &&
      stringify !== Object.prototype.toString
    ) {
      set(out, path, String(value), section, layer);
      return;
    }

    for (const [key, child] of Object.entries(value)) {
      flattenValue(`${path}.${key}`, child, section, layer, out);
    }
  }
}

/** Pulls the raw XDR operations back out of an SDK transaction. */
function rawOperations(transaction: Transaction): xdr.Operation[] {
  const envelope = transaction.toEnvelope();
  return envelope.switch().name === "envelopeTypeTxV0"
    ? envelope.v0().tx().operations()
    : envelope.v1().tx().operations();
}

function flattenSignatures(
  signatures: xdr.DecoratedSignature[],
  prefix: string,
  layer: DiffLayer,
  out: FieldMap
): void {
  set(out, `${prefix}.signatures.count`, String(signatures.length), "signatures", layer);

  signatures.forEach((signature, index) => {
    set(
      out,
      `${prefix}.signatures[${index}].hint`,
      toHex(new Uint8Array(signature.hint())),
      "signatures",
      layer
    );
    set(
      out,
      `${prefix}.signatures[${index}].signature`,
      toHex(new Uint8Array(signature.signature())),
      "signatures",
      layer
    );
  });
}

function flattenTransaction(
  transaction: Transaction,
  prefix: string,
  layer: DiffLayer,
  out: FieldMap
): void {
  set(out, `${prefix}.source`, transaction.source, "body", layer);
  set(out, `${prefix}.sequence`, transaction.sequence, "body", layer);
  set(out, `${prefix}.fee`, transaction.fee, "body", layer);

  flattenValue(`${prefix}.memo`, { type: transaction.memo.type }, "body", layer, out);
  if (transaction.memo.value !== null && transaction.memo.value !== undefined) {
    flattenValue(`${prefix}.memo.value`, transaction.memo.value, "body", layer, out);
  }

  flattenValue(`${prefix}.timeBounds`, transaction.timeBounds, "body", layer, out);
  flattenValue(`${prefix}.ledgerBounds`, transaction.ledgerBounds, "body", layer, out);
  flattenValue(`${prefix}.minAccountSequence`, transaction.minAccountSequence, "body", layer, out);
  flattenValue(
    `${prefix}.minAccountSequenceAge`,
    transaction.minAccountSequenceAge,
    "body",
    layer,
    out
  );
  flattenValue(
    `${prefix}.minAccountSequenceLedgerGap`,
    transaction.minAccountSequenceLedgerGap,
    "body",
    layer,
    out
  );
  flattenValue(`${prefix}.extraSigners`, transaction.extraSigners, "body", layer, out);

  const raw = rawOperations(transaction);
  set(out, `${prefix}.operations.count`, String(raw.length), "operations", layer);

  raw.forEach((operation, index) => {
    const operationPath = `${prefix}.operations[${index}]`;

    // The readable fields come from the SDK's own operation model.
    flattenValue(
      operationPath,
      Operation.fromXDRObject(operation),
      "operations",
      layer,
      out
    );

    // …and the canonical XDR beside them, so a field this tool does not model
    // still shows up as a change instead of being silently dropped.
    set(out, `${operationPath}.xdr`, operation.toXDR("base64"), "operations", layer);
  });

  flattenSignatures(transaction.signatures, prefix, layer, out);
}

export function envelopeKind(envelope: string): EnvelopeKind | null {
  try {
    switch (xdr.TransactionEnvelope.fromXDR(envelope, "base64").switch().name) {
      case "envelopeTypeTxV0":
        return "classic-v0";
      case "envelopeTypeTx":
        return "classic-v1";
      case "envelopeTypeTxFeeBump":
        return "fee-bump";
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * Turns one envelope into a flat map of field paths.
 *
 * A fee-bump envelope keeps its two layers on separate prefixes — `outer.*`
 * and `inner.*` — so a change to the wrapper can never be reported as a change
 * to the transaction that executes.
 */
export function flattenEnvelope(envelope: string, networkPassphrase: string): FieldMap | null {
  const kind = envelopeKind(envelope);
  if (!kind) return null;

  const out: FieldMap = new Map();
  set(out, "envelopeType", kind, "envelope", "envelope");

  try {
    const decoded = TransactionBuilder.fromXDR(envelope, networkPassphrase);

    if (decoded instanceof FeeBumpTransaction) {
      set(out, "outer.feeSource", decoded.feeSource, "body", "outer");
      set(out, "outer.maxFee", decoded.fee, "body", "outer");
      flattenSignatures(decoded.signatures, "outer", "outer", out);
      flattenTransaction(decoded.innerTransaction, "inner", "inner", out);
      return out;
    }

    flattenTransaction(decoded, "tx", "envelope", out);
    return out;
  } catch {
    return null;
  }
}

/**
 * Sort key that orders `[2]` before `[10]`.
 *
 * Plain alphabetical ordering puts `operations[10]` between `operations[1]`
 * and `operations[2]`, which makes a long operation list unreadable and the
 * JSON export unstable to reason about.
 */
export function sortKey(path: string): string {
  return path.replace(/\[(\d+)\]/g, (_, index: string) => `[${index.padStart(6, "0")}]`);
}

export function diffFieldMaps(left: FieldMap, right: FieldMap): DiffEntry[] {
  const paths = [...new Set([...left.keys(), ...right.keys()])].sort((a, b) =>
    sortKey(a).localeCompare(sortKey(b))
  );

  return paths.map((path) => {
    const before = left.get(path) ?? null;
    const after = right.get(path) ?? null;
    const known = (before ?? after) as FieldValue;

    let status: DiffEntry["status"];
    if (before && !after) status = "removed";
    else if (!before && after) status = "added";
    else if (before && after && before.value !== after.value) status = "changed";
    else status = "unchanged";

    return {
      path,
      section: known.section,
      layer: known.layer,
      before: before?.value ?? null,
      after: after?.value ?? null,
      status
    };
  });
}

/**
 * Compares two envelopes field by field.
 *
 * Operations are compared **by position**, not matched up by content: a
 * reordering is a change, because the ledger applies them in order and two
 * transactions with the same operations in a different order do different
 * things.
 */
export function diffEnvelopes({
  left,
  right,
  networkPassphrase
}: DiffInput): Result<DiffSummary, DiffErrorCode> {
  const leftMap = flattenEnvelope(left, networkPassphrase);
  if (!leftMap) return err("invalid_left_xdr");

  const rightMap = flattenEnvelope(right, networkPassphrase);
  if (!rightMap) return err("invalid_right_xdr");

  const entries = diffFieldMaps(leftMap, rightMap);
  const changed = entries.filter((entry) => entry.status !== "unchanged");

  return ok({
    leftKind: leftMap.get("envelopeType")?.value as EnvelopeKind,
    rightKind: rightMap.get("envelopeType")?.value as EnvelopeKind,
    networkPassphrase,
    entries,
    changedCount: changed.length,
    unchangedCount: entries.length - changed.length,
    identical: changed.length === 0,
    signaturesOnly:
      changed.length > 0 && changed.every((entry) => entry.section === "signatures")
  });
}

/**
 * A deterministic JSON summary.
 *
 * Entries are already in a stable sorted order and no timestamp is included,
 * so the same pair of envelopes always produces byte-identical output.
 */
export function toJsonSummary(summary: DiffSummary): string {
  return JSON.stringify(
    {
      leftKind: summary.leftKind,
      rightKind: summary.rightKind,
      identical: summary.identical,
      signaturesOnly: summary.signaturesOnly,
      changedCount: summary.changedCount,
      unchangedCount: summary.unchangedCount,
      changes: summary.entries
        .filter((entry) => entry.status !== "unchanged")
        .map((entry) => ({
          path: entry.path,
          section: entry.section,
          layer: entry.layer,
          status: entry.status,
          before: entry.before,
          after: entry.after
        }))
    },
    null,
    2
  );
}
