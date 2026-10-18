import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { buildSummaryText } from "@/features/ledger-protocol-transition-map/lib/format";
import {
  HorizonStatusError,
  toLedgerProtocolTransitionMapErrorCode
} from "@/features/ledger-protocol-transition-map/lib/ledgerProtocolTransitionMap.errors";
import {
  filterToRequestedRange,
  normalizeFetchedLedgers
} from "@/features/ledger-protocol-transition-map/lib/ledger-pages";
import { groupProtocolRuns } from "@/features/ledger-protocol-transition-map/lib/protocol-runs";
import {
  classifyTransitions,
  detectSequenceGaps
} from "@/features/ledger-protocol-transition-map/lib/transition-evidence";
import {
  PAGE_LIMIT,
  type HorizonProtocolLedger,
  type LedgerProtocolTransitionMapErrorCode,
  type LedgerProtocolTransitionMapInput,
  type LedgerProtocolTransitionMapResult
} from "@/features/ledger-protocol-transition-map/types";

const REQUEST_TIMEOUT_MS = 20_000;

interface HorizonLedgerPage {
  _embedded?: { records?: HorizonProtocolLedger[] };
  records?: HorizonProtocolLedger[];
}

function recordsFromPage(page: HorizonLedgerPage): HorizonProtocolLedger[] {
  if (Array.isArray(page._embedded?.records)) return page._embedded.records;
  if (Array.isArray(page.records)) return page.records;
  return [];
}

export async function fetchBoundedLedgerPages(
  input: LedgerProtocolTransitionMapInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<
  Result<{ records: HorizonProtocolLedger[]; partialPage: boolean }, LedgerProtocolTransitionMapErrorCode>
> {
  const collected: HorizonProtocolLedger[] = [];
  let cursor = (input.startLedger - 1n).toString();
  let remaining = input.count;
  let partialPage = false;

  while (remaining > 0) {
    const limit = Math.min(PAGE_LIMIT, remaining);
    const controller = new AbortController();
    const abortFromCaller = () => controller.abort();
    if (signal?.aborted) abortFromCaller();
    else signal?.addEventListener("abort", abortFromCaller, { once: true });
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(
        horizonUrl(network, "/ledgers", {
          order: "asc",
          limit,
          cursor
        }),
        {
          signal: controller.signal,
          headers: { Accept: "application/json" }
        }
      );

      if (!response.ok) throw new HorizonStatusError(response.status);

      const page = (await response.json()) as HorizonLedgerPage;
      const records = recordsFromPage(page);

      if (records.length === 0) {
        if (collected.length === 0) return err("history_unavailable");
        partialPage = true;
        break;
      }

      collected.push(...records);
      const last = records[records.length - 1]!;
      cursor =
        typeof last.paging_token === "string" && last.paging_token
          ? last.paging_token
          : String(last.sequence ?? cursor);

      if (records.length < limit) {
        partialPage = true;
        break;
      }

      remaining = input.count - collected.length;
    } catch (error) {
      return err(toLedgerProtocolTransitionMapErrorCode(error));
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abortFromCaller);
    }
  }

  if (collected.length < input.count) partialPage = true;

  return ok({ records: collected, partialPage });
}

export function analyzeProtocolLedgers(
  records: HorizonProtocolLedger[],
  input: LedgerProtocolTransitionMapInput,
  network: StellarNetwork,
  partialPage: boolean
): Result<LedgerProtocolTransitionMapResult, LedgerProtocolTransitionMapErrorCode> {
  const normalized = normalizeFetchedLedgers(records);
  if (!normalized.ok) return normalized;

  const ledgers = filterToRequestedRange(
    normalized.value.ledgers,
    input.startLedger,
    input.count
  );

  if (ledgers.length === 0) return err("history_unavailable");

  const runs = groupProtocolRuns(ledgers);
  const gaps = detectSequenceGaps(ledgers);
  const transitions = classifyTransitions(ledgers).map((transition) =>
    partialPage && transition.certainty === "uncertain"
      ? { ...transition, reason: "partial_page" as const }
      : transition
  );

  const start = ledgers[0]!.sequence;
  const end = ledgers[ledgers.length - 1]!.sequence;

  return ok({
    network,
    startLedger: start,
    requestedCount: input.count,
    observedCount: ledgers.length,
    endLedger: end,
    runs,
    transitions,
    gaps,
    partialPage: partialPage || ledgers.length < input.count,
    summaryText: buildSummaryText({
      network,
      start,
      end,
      observed: ledgers.length,
      transitions
    })
  });
}

export async function runLedgerProtocolTransitionMap(
  input: LedgerProtocolTransitionMapInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<LedgerProtocolTransitionMapResult, LedgerProtocolTransitionMapErrorCode>> {
  const fetched = await fetchBoundedLedgerPages(input, network, signal);
  if (!fetched.ok) return fetched;
  return analyzeProtocolLedgers(fetched.value.records, input, network, fetched.value.partialPage);
}
