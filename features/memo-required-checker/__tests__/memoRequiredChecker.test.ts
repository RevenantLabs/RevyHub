import { describe, expect, it } from "vitest";
import { runMemoRequiredChecker } from "@/features/memo-required-checker/lib/memoRequiredChecker";
import {
  accountId,
  accountRecord,
  declinedToml,
  homeDomain,
  malformedValue,
  requiredToml,
  silentToml,
  tomlUrl
} from "@/features/memo-required-checker/fixtures/memoRequiredChecker.fixture";
import { noSignalAccount } from "@/features/memo-required-checker/fixtures/no-signal-account.fixture";
import { MEMO_REQUIRED_KEY } from "@/features/memo-required-checker/lib/memo-required-flag";

const input = { accountId };

function fetchRoutes(account: unknown, toml?: { body: string; status?: number }): typeof fetch {
  return (async (url: string | URL | Request) => {
    const target = String(url);
    if (target.endsWith(`/accounts/${accountId}`)) {
      if (account === 404) return new Response("missing", { status: 404 });
      if (account === 429) return new Response("slow", { status: 429 });
      if (account === 500) return new Response("down", { status: 500 });
      return new Response(JSON.stringify(account), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (target === tomlUrl) {
      return new Response(toml?.body ?? "", { status: toml?.status ?? 200 });
    }
    return new Response("missing", { status: 404 });
  }) as typeof fetch;
}

describe("runMemoRequiredChecker", () => {
  it("combines a SEP-29 data entry with a toml policy and names both sources", async () => {
    const result = await runMemoRequiredChecker(input, "testnet", undefined, {
      fetchImpl: fetchRoutes(accountRecord(), { body: requiredToml })
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.verdict).toBe("required");
    expect(result.value.sources).toEqual(["data_entry", "stellar_toml"]);
    expect(result.value.homeDomain).toBe(homeDomain);
    expect(result.value.bestEffortNotice).toMatch(/best-effort/i);
  });

  it("returns not-required when neither signal is present", async () => {
    const result = await runMemoRequiredChecker(input, "testnet", undefined, {
      fetchImpl: fetchRoutes(accountRecord({ data: noSignalAccount.data, homeDomain: noSignalAccount.home_domain }))
    });
    expect(result.ok && result.value.verdict).toBe("not_required");
    expect(result.ok && result.value.tomlUrl).toBeNull();
  });

  it("keeps a declined toml visible when the data entry still requires a memo", async () => {
    const result = await runMemoRequiredChecker(input, "testnet", undefined, {
      fetchImpl: fetchRoutes(accountRecord(), { body: declinedToml })
    });
    expect(result.ok && result.value.conflict).toBe(true);
    expect(result.ok && result.value.verdict).toBe("required");
    expect(result.ok && result.value.toml).toBe("not_required");
  });

  it("does not call a failed toml fetch not-required", async () => {
    const result = await runMemoRequiredChecker(input, "testnet", undefined, {
      fetchImpl: fetchRoutes(accountRecord({ data: {} }), { body: silentToml, status: 503 })
    });
    expect(result).toEqual({ ok: false, code: "toml_unreachable" });
  });

  it("maps malformed data, missing accounts, rate limits, and server errors", async () => {
    expect(
      await runMemoRequiredChecker(input, "testnet", undefined, {
        fetchImpl: fetchRoutes(accountRecord({ data: { [MEMO_REQUIRED_KEY]: malformedValue }, homeDomain: null }))
      })
    ).toEqual({ ok: false, code: "malformed_data_entry" });

    expect(
      await runMemoRequiredChecker(input, "testnet", undefined, { fetchImpl: fetchRoutes(404) })
    ).toEqual({ ok: false, code: "account_not_found" });

    expect(
      await runMemoRequiredChecker(input, "testnet", undefined, { fetchImpl: fetchRoutes(429) })
    ).toEqual({ ok: false, code: "rate_limited" });

    expect(
      await runMemoRequiredChecker(input, "testnet", undefined, { fetchImpl: fetchRoutes(500) })
    ).toEqual({ ok: false, code: "request_failed" });
  });
});
