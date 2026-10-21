import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { BEST_EFFORT_NOTICE } from "@/features/memo-required-checker/lib/format";
import {
  readHomeDomain,
  readTomlMemoPolicy,
  stellarTomlUrl
} from "@/features/memo-required-checker/lib/home-domain-policy";
import { readMemoRequiredFlag } from "@/features/memo-required-checker/lib/memo-required-flag";
import { toMemoRequiredCheckerErrorCode } from "@/features/memo-required-checker/lib/memoRequiredChecker.errors";
import { mergeVerdict } from "@/features/memo-required-checker/lib/verdict-merge";
import type {
  MemoRequiredCheckerErrorCode,
  MemoRequiredCheckerInput,
  MemoRequiredCheckerResult,
  MemoSignal
} from "@/features/memo-required-checker/types";

export interface CheckerDeps {
  fetchImpl?: typeof fetch;
}

interface AccountPayload {
  account_id?: unknown;
  home_domain?: unknown;
  data?: unknown;
}

export async function runMemoRequiredChecker(
  input: MemoRequiredCheckerInput,
  network: StellarNetwork,
  signal?: AbortSignal,
  deps: CheckerDeps = {}
): Promise<Result<MemoRequiredCheckerResult, MemoRequiredCheckerErrorCode>> {
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  let account: AccountPayload;

  try {
    const response = await fetchImpl(horizonUrl(network, `/accounts/${input.accountId}`), {
      signal,
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return err(toMemoRequiredCheckerErrorCode({ status: response.status }));
    account = (await response.json()) as AccountPayload;
  } catch (error) {
    return err(toMemoRequiredCheckerErrorCode(error));
  }

  if (typeof account.account_id !== "string" || !isStringRecord(account.data)) {
    return err("request_failed");
  }

  const dataEntry = readMemoRequiredFlag(account.data);
  if (!dataEntry.ok) return err(dataEntry.code);

  const homeDomain = readHomeDomain({
    home_domain: typeof account.home_domain === "string" ? account.home_domain : null
  });
  if (!homeDomain.ok) return err(homeDomain.code);

  const toml = await readToml(homeDomain.value, fetchImpl, signal);
  if (!toml.ok) return err(toml.code);

  const merged = mergeVerdict(dataEntry.value, toml.value.signal);

  return ok({
    accountId: input.accountId,
    network,
    verdict: merged.verdict,
    dataEntry: dataEntry.value,
    toml: toml.value.signal,
    sources: merged.sources,
    conflict: merged.conflict,
    homeDomain: homeDomain.value,
    tomlUrl: toml.value.tomlUrl,
    bestEffortNotice: BEST_EFFORT_NOTICE
  });
}

async function readToml(
  homeDomain: string | null,
  fetchImpl: typeof fetch,
  signal?: AbortSignal
): Promise<Result<{ signal: MemoSignal; tomlUrl: string | null }, MemoRequiredCheckerErrorCode>> {
  if (!homeDomain) return ok({ signal: "absent", tomlUrl: null });

  const tomlUrl = stellarTomlUrl(homeDomain);
  let raw: string;
  try {
    const response = await fetchImpl(tomlUrl, {
      signal,
      redirect: "manual",
      headers: { Accept: "text/plain, text/x-toml, */*" }
    });
    if (!response.ok || (response.status >= 300 && response.status < 400)) return err("toml_unreachable");
    raw = await response.text();
  } catch {
    return err("toml_unreachable");
  }

  const policy = readTomlMemoPolicy(raw);
  if (!policy.ok) return err(policy.code);
  return ok({ signal: policy.value, tomlUrl });
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((entry) => typeof entry === "string")
  );
}
