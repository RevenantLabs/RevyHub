import {
  encodeMuxedAccountToAddress,
  extractBaseAddress,
  FeeBumpTransaction,
  StrKey,
  Transaction,
  TransactionBuilder,
  xdr
} from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  AccountThresholds,
  EnvelopeKind,
  RotationChange,
  RotationStep,
  SignerEntry,
  SignerKind,
  SignerRotationErrorCode
} from "@/features/signer-rotation-impact-auditor/types";

type Json = Record<string, unknown>;

export interface ParsedAccountSnapshot {
  accountId: string;
  signers: SignerEntry[];
  thresholds: AccountThresholds;
  hasSigners: boolean;
  hasThresholds: boolean;
}

export interface ParsedEnvelope {
  kind: EnvelopeKind;
  transactionSource: string;
  operations: ParsedOperation[];
}

export interface ParsedOperation {
  index: number;
  type: string;
  effectiveSource: string;
  inheritedSource: boolean;
  setOptions: SetOptionsFields | null;
}

export interface SetOptionsFields {
  masterWeight: number | null;
  lowThreshold: number | null;
  medThreshold: number | null;
  highThreshold: number | null;
  signer: { key: string; kind: SignerKind; weight: number } | null;
}

function isJson(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unsignedWeight(value: unknown): string | null {
  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 0 || value > 255) return null;
    return String(value);
  }
  if (typeof value === "string" && /^\d+$/.test(value)) {
    try {
      const parsed = BigInt(value);
      if (parsed < 0n || parsed > 255n) return null;
      return parsed.toString();
    } catch {
      return null;
    }
  }
  return null;
}

function signerKind(raw: unknown): SignerKind | null {
  if (raw === "ed25519_public_key") return "ed25519_public_key";
  if (raw === "sha256_hash") return "sha256_hash";
  if (raw === "preauth_tx") return "preauth_tx";
  if (raw === "ed25519_signed_payload") return "ed25519_signed_payload";
  return null;
}

/**
 * Parses a Horizon account resource into signer/threshold evidence.
 *
 * Missing `signers` or `thresholds` are recorded as absent evidence rather
 * than defaulted — inventing zeros would turn incomplete input into a false
 * "unlocked" claim.
 */
export function parseAccountSnapshot(
  raw: string
): Result<ParsedAccountSnapshot, SignerRotationErrorCode> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return err("malformed_data");
  }

  if (!isJson(parsed)) return err("malformed_data");

  const accountId = parsed.account_id;
  if (typeof accountId !== "string" || !StrKey.isValidEd25519PublicKey(accountId)) {
    return err("malformed_data");
  }

  const hasSigners = Array.isArray(parsed.signers);
  const hasThresholds = isJson(parsed.thresholds);

  const signers: SignerEntry[] = [];

  if (hasSigners) {
    for (const entry of parsed.signers as unknown[]) {
      if (!isJson(entry)) return err("malformed_data");
      const key = entry.key;
      const kind = signerKind(entry.type);
      const weight = unsignedWeight(entry.weight);
      if (typeof key !== "string" || !key || kind === null || weight === null) {
        return err("malformed_data");
      }
      signers.push({
        key,
        weight,
        kind,
        isMaster: kind === "ed25519_public_key" && key === accountId
      });
    }
  }

  let thresholds: AccountThresholds = { low: null, medium: null, high: null };

  if (hasThresholds) {
    const rawThresholds = parsed.thresholds as Json;
    const low = unsignedWeight(rawThresholds.low_threshold);
    const medium = unsignedWeight(rawThresholds.med_threshold);
    const high = unsignedWeight(rawThresholds.high_threshold);
    if (low === null || medium === null || high === null) return err("malformed_data");
    thresholds = { low, medium, high };
  }

  return ok({ accountId, signers, thresholds, hasSigners, hasThresholds });
}

function describeMuxed(account: xdr.MuxedAccount): string {
  return encodeMuxedAccountToAddress(account, true);
}

function normalizeSource(address: string): string {
  return address.startsWith("M") ? extractBaseAddress(address) : address;
}

function readSignerFromOp(signer: {
  ed25519PublicKey?: string;
  sha256Hash?: string;
  preAuthTx?: string;
  ed25519SignedPayload?: string;
  weight: number;
}): { key: string; kind: SignerKind; weight: number } | null {
  if (typeof signer.weight !== "number" || !Number.isInteger(signer.weight)) return null;
  if (signer.weight < 0 || signer.weight > 255) return null;

  if (typeof signer.ed25519PublicKey === "string") {
    return { key: signer.ed25519PublicKey, kind: "ed25519_public_key", weight: signer.weight };
  }
  if (typeof signer.sha256Hash === "string") {
    return { key: signer.sha256Hash, kind: "sha256_hash", weight: signer.weight };
  }
  if (typeof signer.preAuthTx === "string") {
    return { key: signer.preAuthTx, kind: "preauth_tx", weight: signer.weight };
  }
  if (typeof signer.ed25519SignedPayload === "string") {
    return {
      key: signer.ed25519SignedPayload,
      kind: "ed25519_signed_payload",
      weight: signer.weight
    };
  }
  return null;
}

function readSetOptions(operation: {
  type: string;
  masterWeight?: number;
  lowThreshold?: number;
  medThreshold?: number;
  highThreshold?: number;
  signer?: {
    ed25519PublicKey?: string;
    sha256Hash?: string;
    preAuthTx?: string;
    ed25519SignedPayload?: string;
    weight: number;
  };
}): SetOptionsFields | null {
  if (operation.type !== "setOptions") return null;

  const signer =
    operation.signer === undefined ? null : readSignerFromOp(operation.signer);
  if (operation.signer !== undefined && signer === null) return null;

  return {
    masterWeight:
      operation.masterWeight === undefined ? null : operation.masterWeight,
    lowThreshold: operation.lowThreshold === undefined ? null : operation.lowThreshold,
    medThreshold: operation.medThreshold === undefined ? null : operation.medThreshold,
    highThreshold: operation.highThreshold === undefined ? null : operation.highThreshold,
    signer
  };
}

/**
 * Decodes a classic or fee-bump envelope and lists every operation with its
 * effective source account.
 */
export function parseEnvelope(
  envelopeXdr: string,
  networkPassphrase: string
): Result<ParsedEnvelope, SignerRotationErrorCode> {
  let decoded: xdr.TransactionEnvelope;

  try {
    decoded = xdr.TransactionEnvelope.fromXDR(envelopeXdr, "base64");
  } catch {
    return err("malformed_data");
  }

  let built: Transaction | FeeBumpTransaction;
  try {
    built = TransactionBuilder.fromXDR(envelopeXdr, networkPassphrase);
  } catch {
    return err("malformed_data");
  }

  try {
    const kindName = decoded.switch().name;

    if (kindName === "envelopeTypeTxV0") {
      if (!(built instanceof Transaction)) return err("malformed_data");
      const tx = decoded.v0().tx();
      const transactionSource = StrKey.encodeEd25519PublicKey(tx.sourceAccountEd25519());
      return ok({
        kind: "classic-v0",
        transactionSource,
        operations: mapOperations(
          built.operations as SdkOperation[],
          transactionSource,
          tx.operations()
        )
      });
    }

    if (kindName === "envelopeTypeTx") {
      if (!(built instanceof Transaction)) return err("malformed_data");
      const tx = decoded.v1().tx();
      const transactionSource = describeMuxed(tx.sourceAccount());
      return ok({
        kind: "classic-v1",
        transactionSource,
        operations: mapOperations(
          built.operations as SdkOperation[],
          transactionSource,
          tx.operations()
        )
      });
    }

    if (kindName === "envelopeTypeTxFeeBump") {
      if (!(built instanceof FeeBumpTransaction)) return err("unsupported_variant");
      const feeBump = decoded.feeBump().tx();
      const innerTx = feeBump.innerTx();
      if (innerTx.switch().name !== "envelopeTypeTx") return err("unsupported_variant");

      const inner = innerTx.v1().tx();
      const transactionSource = describeMuxed(inner.sourceAccount());

      return ok({
        kind: "fee-bump",
        transactionSource,
        operations: mapOperations(
          built.innerTransaction.operations as SdkOperation[],
          transactionSource,
          inner.operations()
        )
      });
    }

    return err("unsupported_variant");
  } catch {
    return err("malformed_data");
  }
}

type SdkOperation = {
  type: string;
  source?: string;
  masterWeight?: number;
  lowThreshold?: number;
  medThreshold?: number;
  highThreshold?: number;
  signer?: {
    ed25519PublicKey?: string;
    sha256Hash?: string;
    preAuthTx?: string;
    ed25519SignedPayload?: string;
    weight: number;
  };
};

function mapOperations(
  operations: readonly SdkOperation[],
  transactionSource: string,
  rawOperations: xdr.Operation[]
): ParsedOperation[] {
  return operations.map((operation, index) => {
    const declared = rawOperations[index]?.sourceAccount();
    const explicit = declared ? describeMuxed(declared) : null;
    const effectiveSource = explicit ?? transactionSource;

    return {
      index,
      type: operation.type,
      effectiveSource,
      inheritedSource: explicit === null,
      setOptions: readSetOptions(operation)
    };
  });
}

/**
 * Turns decoded operations into ordered rotation steps against one snapshot.
 *
 * Only set_options whose effective source matches the snapshot account are
 * marked as applying; other sources are listed but do not mutate the audited
 * signer set. Duplicate signer keys within a later step overwrite earlier
 * weights in application order.
 */
export function normalizeRotationSteps(
  operations: ParsedOperation[],
  accountId: string,
  current: { signers: SignerEntry[]; thresholds: AccountThresholds }
): RotationStep[] {
  const workingSigners = new Map(
    current.signers.map((signer) => [signer.key, { ...signer }] as const)
  );
  const workingThresholds: AccountThresholds = { ...current.thresholds };

  return operations.map((operation) => {
    const applies =
      normalizeSource(operation.effectiveSource) === accountId ||
      operation.effectiveSource === accountId;

    if (!operation.setOptions) {
      return {
        index: operation.index,
        operationType: operation.type,
        effectiveSource: operation.effectiveSource,
        inheritedSource: operation.inheritedSource,
        appliesToSnapshot: applies,
        changes: applies
          ? [
              {
                kind: "ignored_operation",
                target: operation.type,
                before: null,
                after: null
              }
            ]
          : []
      };
    }

    if (!applies) {
      return {
        index: operation.index,
        operationType: operation.type,
        effectiveSource: operation.effectiveSource,
        inheritedSource: operation.inheritedSource,
        appliesToSnapshot: false,
        changes: []
      };
    }

    const changes: RotationChange[] = [];
    const fields = operation.setOptions;

    if (fields.masterWeight !== null) {
      const existing = workingSigners.get(accountId);
      const before = existing?.weight ?? null;
      const after = String(fields.masterWeight);
      changes.push({
        kind: "master_weight",
        target: accountId,
        before,
        after
      });

      if (fields.masterWeight === 0) {
        workingSigners.delete(accountId);
      } else {
        workingSigners.set(accountId, {
          key: accountId,
          weight: after,
          kind: "ed25519_public_key",
          isMaster: true
        });
      }
    }

    if (fields.lowThreshold !== null) {
      changes.push({
        kind: "threshold_low",
        target: "low",
        before: workingThresholds.low,
        after: String(fields.lowThreshold)
      });
      workingThresholds.low = String(fields.lowThreshold);
    }

    if (fields.medThreshold !== null) {
      changes.push({
        kind: "threshold_medium",
        target: "medium",
        before: workingThresholds.medium,
        after: String(fields.medThreshold)
      });
      workingThresholds.medium = String(fields.medThreshold);
    }

    if (fields.highThreshold !== null) {
      changes.push({
        kind: "threshold_high",
        target: "high",
        before: workingThresholds.high,
        after: String(fields.highThreshold)
      });
      workingThresholds.high = String(fields.highThreshold);
    }

    if (fields.signer) {
      const existing = workingSigners.get(fields.signer.key);
      const before = existing?.weight ?? null;
      const after = String(fields.signer.weight);

      if (fields.signer.weight === 0) {
        changes.push({
          kind: "signer_remove",
          target: fields.signer.key,
          before,
          after: "0"
        });
        workingSigners.delete(fields.signer.key);
      } else {
        changes.push({
          kind: "signer_set",
          target: fields.signer.key,
          before,
          after
        });
        workingSigners.set(fields.signer.key, {
          key: fields.signer.key,
          weight: after,
          kind: fields.signer.kind,
          isMaster: fields.signer.key === accountId
        });
      }
    }

    return {
      index: operation.index,
      operationType: "setOptions",
      effectiveSource: operation.effectiveSource,
      inheritedSource: operation.inheritedSource,
      appliesToSnapshot: true,
      changes
    };
  });
}
