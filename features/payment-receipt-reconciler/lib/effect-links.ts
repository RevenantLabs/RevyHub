import { err, ok, type Result } from "@/core/result/result";
import {
  parseReceiptAsset,
  type RawHorizonEffect,
  type RawHorizonOperation
} from "@/features/payment-receipt-reconciler/lib/receipt-fetch";
import type {
  EffectEvidence,
  EffectLink,
  OutsideItem,
  PaymentOperation,
  PaymentReceiptReconcilerErrorCode,
  SupportedPaymentType
} from "@/features/payment-receipt-reconciler/types";

const SUPPORTED_OPS = new Set<string>([
  "payment",
  "path_payment_strict_send",
  "path_payment_strict_receive"
]);

const BALANCE_EFFECTS = new Set(["account_debited", "account_credited"]);

/** `<operation TOID>-<effect index>` */
const EFFECT_ID = /^(\d{1,19})-(\d{1,10})$/;

export function isSupportedPaymentType(type: string): type is SupportedPaymentType {
  return SUPPORTED_OPS.has(type);
}

export function operationIdFromEffectId(effectId: string): string | null {
  const match = EFFECT_ID.exec(effectId);
  return match ? match[1] : null;
}

export function normalizePaymentOperation(
  raw: RawHorizonOperation
): PaymentOperation | null {
  if (!isSupportedPaymentType(raw.type)) return null;

  const asset = parseReceiptAsset(raw.asset_type, raw.asset_code, raw.asset_issuer);
  if (!asset || raw.amount === undefined) return null;

  const operation: PaymentOperation = {
    id: raw.id,
    type: raw.type,
    sourceAccount: raw.source_account,
    from: raw.from ?? raw.source_account,
    to: raw.to ?? "",
    amount: String(raw.amount),
    asset
  };

  if (raw.type !== "payment") {
    const sourceAsset = parseReceiptAsset(
      raw.source_asset_type,
      raw.source_asset_code,
      raw.source_asset_issuer
    );
    if (sourceAsset && raw.source_amount !== undefined) {
      operation.sourceAmount = String(raw.source_amount);
      operation.sourceAsset = sourceAsset;
    }
  }

  return operation;
}

export function normalizeBalanceEffect(raw: RawHorizonEffect): EffectEvidence | null {
  if (!BALANCE_EFFECTS.has(raw.type)) return null;

  const operationId = operationIdFromEffectId(raw.id);
  const asset = parseReceiptAsset(raw.asset_type, raw.asset_code, raw.asset_issuer);
  if (!operationId || !asset || raw.amount === undefined || !raw.account) return null;

  return {
    id: raw.id,
    type: raw.type as EffectEvidence["type"],
    account: raw.account,
    amount: String(raw.amount),
    asset,
    operationId
  };
}

export interface LinkedReceiptParts {
  operations: PaymentOperation[];
  links: EffectLink[];
  outside: OutsideItem[];
}

/**
 * Connects each supported payment operation to its debit and credit effects.
 *
 * Unrelated operation and effect types are collected as `outside` items so
 * they remain auditable rather than being silently dropped.
 */
export function linkOperationsToEffects(
  operations: readonly RawHorizonOperation[],
  effects: readonly RawHorizonEffect[]
): Result<LinkedReceiptParts, PaymentReceiptReconcilerErrorCode> {
  const paymentOps: PaymentOperation[] = [];
  const outside: OutsideItem[] = [];

  for (const raw of operations) {
    const payment = normalizePaymentOperation(raw);
    if (payment) {
      paymentOps.push(payment);
    } else {
      outside.push({ kind: "operation", id: raw.id, type: raw.type });
    }
  }

  if (paymentOps.length === 0) return err("unsupported_operation");

  const paymentIds = new Set(paymentOps.map((op) => op.id));
  const effectsByOp = new Map<string, EffectEvidence[]>();

  for (const raw of effects) {
    const balance = normalizeBalanceEffect(raw);
    if (balance && paymentIds.has(balance.operationId)) {
      const bucket = effectsByOp.get(balance.operationId) ?? [];
      bucket.push(balance);
      effectsByOp.set(balance.operationId, bucket);
      continue;
    }

    // Trade effects on path payments, trustline changes, etc.
    outside.push({ kind: "effect", id: raw.id, type: raw.type });
  }

  const links: EffectLink[] = [];

  for (const operation of paymentOps) {
    const linked = effectsByOp.get(operation.id) ?? [];
    const debits = linked.filter((effect) => effect.type === "account_debited");
    const credits = linked.filter((effect) => effect.type === "account_credited");

    if (debits.length === 0 || credits.length === 0) {
      return err("incomplete_effects");
    }

    links.push({ operationId: operation.id, debits, credits });
  }

  return ok({ operations: paymentOps, links, outside });
}
