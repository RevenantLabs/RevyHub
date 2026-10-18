import { err, ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { DeadlineBoardInput, DeadlineBoardResult, DeadlineBoardErrorCode, DeadlineRow } from "../types";
import { fetchClaimantPages, PageDecodeError, CursorProgressError } from "./claimant-pages";
import { parsePredicate, deadlineFor } from "./deadline-parser";
import { orderDeadlines } from "./deadline-order";
import { toDeadlineBoardErrorCode } from "./claimableBalanceDeadlineBoard.errors";

export async function runClaimableBalanceDeadlineBoard(input: DeadlineBoardInput, network: StellarNetwork, signal?: AbortSignal, nowMs = Date.now()): Promise<Result<DeadlineBoardResult, DeadlineBoardErrorCode>> {
  try {
    const pages = await fetchClaimantPages(input, network, signal);
    const rows: DeadlineRow[] = [];
    for (const record of pages.records) {
      const claimant = record.claimants.find((entry) => entry?.destination === input.claimant);
      if (!claimant) continue;
      // Horizon's last_modified_time is not a dependable creation time.
      const parsed = parsePredicate(claimant.predicate);
      if (!parsed.ok) return err(parsed.code);
      const expiry = deadlineFor(parsed.value);
      rows.push({ id: record.id, amount: record.amount, asset: record.asset, pagingToken: record.paging_token, predicate: parsed.value,
        ...(expiry ? { deadline: expiry.deadline, deadlineKind: expiry.kind, conditionPassed: nowMs >= Date.parse(expiry.deadline) } : {}) });
    }
    return ok({ claimant: input.claimant, pagesFetched: pages.pagesFetched, limitReached: pages.limitReached, nextCursor: pages.nextCursor, ...orderDeadlines(rows) });
  } catch (error) {
    if (error instanceof CursorProgressError) return err("invalid_cursor");
    if (error instanceof PageDecodeError) return err("request_failed");
    return err(toDeadlineBoardErrorCode(error, Boolean(input.cursor)));
  }
}
