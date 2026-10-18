import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode, EventFilterInput, GetEventsParams } from "../types";
import { encodeTopicSelector } from "./topic-codec";

export const MAX_CONTRACTS = 5;
export const MAX_TOPICS = 5;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 20;

export interface FilterDraft {
  contractIds: string;
  eventType: string;
  topics: string;
  startLedger: string;
  cursor: string;
  limit: string;
  cursorNetwork?: string;
  network?: string;
}

/** Build the exact getEvents parameter object. No request is made here. */
export function buildEventFilter(draft: FilterDraft): Result<EventFilterInput, ErrorCode> {
  const contractIds = draft.contractIds
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (contractIds.length === 0 || contractIds.length > MAX_CONTRACTS) return err("invalid_contract_id");
  if (contractIds.some((id) => id.startsWith("S") || !StrKey.isValidContract(id))) {
    return err("invalid_contract_id");
  }

  const topics: EventFilterInput["topics"] = [];
  const topicParts = draft.topics.split(",").map((item) => item.trim()).filter(Boolean);
  if (topicParts.length > MAX_TOPICS) return err("invalid_topic");
  for (const part of topicParts) {
    const encoded = encodeTopicSelector(part);
    if (!encoded.ok) return encoded;
    topics.push(encoded.value);
  }

  if (!/^[1-9][0-9]{0,9}$/.test(draft.startLedger.trim())) return err("invalid_start_ledger");
  const startLedger = Number(draft.startLedger.trim());
  if (!Number.isSafeInteger(startLedger)) return err("invalid_start_ledger");

  const limitText = draft.limit.trim() || String(DEFAULT_LIMIT);
  if (!/^[1-9][0-9]{0,2}$/.test(limitText)) return err("invalid_start_ledger");
  const limit = Number(limitText);
  if (limit > MAX_LIMIT) return err("invalid_start_ledger");

  const cursor = draft.cursor.trim();
  const reusable = cursor && draft.cursorNetwork === draft.network ? cursor : undefined;
  return ok({
    contractIds,
    eventType: draft.eventType === "All" ? undefined : (draft.eventType.toLowerCase() as EventFilterInput["eventType"]),
    topics,
    startLedger,
    cursor: reusable,
    limit
  });
}

export function toGetEventsParams(input: EventFilterInput): GetEventsParams {
  const filter: GetEventsParams["filters"][number] = { contractIds: input.contractIds };
  if (input.eventType) filter.type = input.eventType;
  if (input.topics.length) filter.topics = [input.topics];
  const pagination: GetEventsParams["pagination"] = { limit: input.limit };
  if (input.cursor) pagination.cursor = input.cursor;
  return { startLedger: input.startLedger, filters: [filter], pagination };
}
