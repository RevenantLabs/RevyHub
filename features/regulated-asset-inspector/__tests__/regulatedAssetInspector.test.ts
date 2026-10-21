import { describe, expect, it } from "vitest";
import { runRegulatedAssetInspector } from "@/features/regulated-asset-inspector/lib/regulatedAssetInspector";
import {
  accountRecord,
  issuerId,
  malformedToml,
  regulatedToml,
  tomlUrl,
  unregulatedToml
} from "@/features/regulated-asset-inspector/fixtures/regulatedAssetInspector.fixture";

const input = { issuerId, assetCode: "USDC" };

function fetchToml(body: string, status = 200): typeof fetch {
  return (async (url: string | URL | Request) => {
    if (String(url) !== tomlUrl) return new Response("missing", { status: 404 });
    return new Response(body, { status });
  }) as typeof fetch;
}

describe("runRegulatedAssetInspector", () => {
  it("shows a regulated asset with approval fields and separate issuer flags", async () => {
    const result = await runRegulatedAssetInspector(input, "testnet", undefined, {
      loadAccount: async () => accountRecord,
      fetchImpl: fetchToml(regulatedToml)
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.regulatedStatus).toBe("regulated");
    expect(result.value.approvalServer).toBe("https://issuer.example/approve");
    expect(result.value.issuerFlags.authRequired).toBe(true);
    expect(result.value.selfPublishedNotice).toMatch(/not independently verified/i);
  });

  it("treats a missing regulated field as explicitly not regulated", async () => {
    const result = await runRegulatedAssetInspector(input, "testnet", undefined, {
      loadAccount: async () => accountRecord,
      fetchImpl: fetchToml(unregulatedToml)
    });
    expect(result.ok && result.value.regulatedStatus).toBe("not_regulated");
    expect(result.ok && result.value.regulatedFieldPresent).toBe(false);
  });

  it("does not call a failed toml fetch not-regulated", async () => {
    const result = await runRegulatedAssetInspector(input, "testnet", undefined, {
      loadAccount: async () => accountRecord,
      fetchImpl: fetchToml("", 503)
    });
    expect(result).toEqual({ ok: false, code: "toml_unreachable" });
  });

  it("reports a missing currency, malformed toml, missing domain, and missing account", async () => {
    expect(
      await runRegulatedAssetInspector(
        { issuerId, assetCode: "EURC" },
        "testnet",
        undefined,
        { loadAccount: async () => accountRecord, fetchImpl: fetchToml(regulatedToml) }
      )
    ).toEqual({ ok: false, code: "currency_not_found" });

    expect(
      await runRegulatedAssetInspector(input, "testnet", undefined, {
        loadAccount: async () => accountRecord,
        fetchImpl: fetchToml(malformedToml)
      })
    ).toEqual({ ok: false, code: "malformed_toml" });

    expect(
      await runRegulatedAssetInspector(input, "testnet", undefined, {
        loadAccount: async () => ({ home_domain: "" })
      })
    ).toEqual({ ok: false, code: "missing_home_domain" });

    expect(
      await runRegulatedAssetInspector(input, "testnet", undefined, {
        loadAccount: async () => {
          throw Object.assign(new Error("missing"), { response: { status: 404 } });
        }
      })
    ).toEqual({ ok: false, code: "account_not_found" });
  });
});
