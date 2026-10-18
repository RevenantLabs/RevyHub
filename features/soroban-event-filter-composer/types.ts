import type { StellarNetwork } from "@/core/network/types";

export type RawInput = Record<string, string>;

export type ErrorCode =
  | "invalid_contract_id"
  | "invalid_topic"
  | "invalid_start_ledger"
  | "history_unavailable"
  | "rate_limited"
  | "request_failed";

export type EventKind = "contract" | "system" | "diagnostic";

/** A topic filter entry is either the getEvents wildcard or base64 ScVal XDR. */
export type TopicSelector = "*" | string;

export interface EventFilterInput {
  contractIds: string[];
  eventType?: EventKind;
  topics: TopicSelector[];
  startLedger: number;
  cursor?: string;
  limit: number;
}

export interface GetEventsFilter {
  type?: EventKind;
  contractIds: string[];
  topics?: TopicSelector[][];
}

export interface GetEventsParams {
  startLedger: number;
  filters: GetEventsFilter[];
  pagination: { limit: number; cursor?: string };
}

export interface EventRow {
  id: string;
  type: string;
  ledger: string;
  contractId: string;
  topics: string[];
  value: string;
}

export interface EventFilterReport {
  network: StellarNetwork;
  filter: GetEventsParams;
  startLedger: string;
  oldestLedger: string;
  latestLedger: string;
  cursor?: string;
  truncated: boolean;
  rows: EventRow[];
}

export interface RpcEvent {
  id?: string;
  type?: string;
  ledger?: number;
  contractId?: string;
  topic?: string[];
  value?: { xdr?: string };
}

export interface EventsPage {
  events?: RpcEvent[];
  cursor?: string;
  oldestLedger?: number;
  latestLedger?: number;
}
