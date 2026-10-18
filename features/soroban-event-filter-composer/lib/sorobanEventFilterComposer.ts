import { isRpcFailure, sorobanRpc } from "@/core/rpc/client";
import { err, ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { ErrorCode, EventFilterInput, EventFilterReport, EventsPage, EventRow, RpcEvent } from "../types";
import { mergeEventPages } from "./event-pages";
import { mapRpcFailure, mapTransport } from "./sorobanEventFilterComposer.errors";
import { toGetEventsParams } from "./filter-builder";
import { decodeTopicXdr } from "./topic-codec";

interface LatestLedger {
  sequence: number;
  oldestLedger?: number;
}

function present(encoded: string | undefined): string {
  if (!encoded) return "";
  const decoded = decodeTopicXdr(encoded);
  return decoded.ok ? decoded.value : "undecoded";
}

function toRow(event: RpcEvent, index: number): EventRow {
  return {
    id: event.id || `event-${index}`,
    type: event.type || "contract",
    ledger: String(event.ledger ?? ""),
    contractId: event.contractId || "",
    topics: (event.topic ?? []).map((topic) => present(topic)),
    value: present(event.value?.xdr)
  };
}

export async function composeEventFilter(
  input: EventFilterInput,
  network: StellarNetwork,
  previousRows: EventRow[] = [],
  signal?: AbortSignal
): Promise<Result<EventFilterReport, ErrorCode>> {
  const filter = toGetEventsParams(input);
  try {
    const latest = await sorobanRpc<LatestLedger>("getLatestLedger", {}, { network, signal });
    if (isRpcFailure(latest)) return mapRpcFailure(latest.error);
    const oldest = latest.result.oldestLedger ?? 0;
    if (input.startLedger < oldest) return err("history_unavailable");

    const page = await sorobanRpc<EventsPage>("getEvents", filter, { network, signal });
    if (isRpcFailure(page)) return mapRpcFailure(page.error);
    const merged = mergeEventPages(
      previousRows.length ? { network, rows: previousRows } : null,
      {
        network,
        rows: (page.result.events ?? []).map(toRow),
        cursor: page.result.cursor
      }
    );
    return ok({
      network,
      filter,
      startLedger: String(input.startLedger),
      oldestLedger: String(page.result.oldestLedger ?? oldest),
      latestLedger: String(page.result.latestLedger ?? latest.result.sequence),
      cursor: merged.cursor,
      truncated: merged.truncated,
      rows: merged.rows
    });
  } catch (error) {
    if (signal?.aborted) return err("request_failed");
    return err(mapTransport(error));
  }
}
