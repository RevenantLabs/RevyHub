/**
 * Effects are what the ledger actually changed. An operation states an
 * intention; the effects it produced state the consequences, including ones
 * the operation never named.
 */
export type EffectCategory = "balance" | "configuration";

/**
 * The identity of a field an effect renders. Codes, not English: `copy.ts`
 * owns the labels so wording changes never reach this module.
 */
export type EffectFieldKey =
  | "amount"
  | "startingBalance"
  | "sold"
  | "bought"
  | "seller"
  | "offerId"
  | "asset"
  | "trustLimit"
  | "trustor"
  | "signerKey"
  | "signerWeight"
  | "thresholds"
  | "flags"
  | "homeDomain"
  | "inflationDestination"
  | "dataName"
  | "newSequence"
  | "balanceId"
  | "sponsor"
  | "newSponsor"
  | "formerSponsor"
  | "liquidityPool"
  | "contract";

export interface EffectField {
  key: EffectFieldKey;
  value: string;
  /** Identifiers render middle-truncated in a monospace face. */
  identifier?: boolean;
}

export interface TimelineEffect {
  /** Horizon effect id: `<operation TOID>-<effect index>`. */
  id: string;
  /** The operation TOID, as a decimal string (it exceeds 2^53). */
  operationId: string;
  /** The operation TOID with its operation bits cleared. */
  transactionId: string;
  ledger: number;
  /** Application order of the transaction inside its ledger. */
  transactionIndex: number;
  /** Position of the operation inside its transaction. */
  operationIndex: number;
  effectIndex: number;
  type: string;
  category: EffectCategory;
  createdAt: string;
  fields: EffectField[];
}

/** The effects a single operation produced, in ledger-application order. */
export interface OperationGroup {
  operationId: string;
  operationIndex: number;
  effects: TimelineEffect[];
}

export interface TransactionGroup {
  transactionId: string;
  ledger: number;
  transactionIndex: number;
  createdAt: string;
  operations: OperationGroup[];
  effectCount: number;
  balanceEffectCount: number;
  configurationEffectCount: number;
  /** This transaction's newer effects were shown on the previous page. */
  continuedFromNewerPage: boolean;
  /** This transaction's older effects continue onto the next page. */
  continuesOnOlderPage: boolean;
}

export interface EffectsTimelinePage {
  accountId: string;
  /** Newest transaction first; effects inside each group run oldest first. */
  groups: TransactionGroup[];
  effectCount: number;
  hasOlder: boolean;
  /** Cursor that starts the next, older page. */
  olderCursor: string | null;
  /** Transaction whose remaining effects begin the older page. */
  carryTransactionId: string | null;
}

export interface EffectsTimelineInput {
  accountId: string;
}

export interface EffectsTimelineRequest {
  cursor?: string;
  /** Transaction the newer page ended on, used to label a continued group. */
  carryTransactionId?: string;
  signal?: AbortSignal;
}

export type EffectsTimelineErrorCode =
  | "empty_input"
  | "invalid_address"
  | "account_not_found"
  | "rate_limited"
  | "request_failed";
