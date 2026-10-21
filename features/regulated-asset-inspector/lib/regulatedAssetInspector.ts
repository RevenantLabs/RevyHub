import { err, ok, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { normalizeApproval } from "@/features/regulated-asset-inspector/lib/approval-criteria";
import { SELF_PUBLISHED_NOTICE } from "@/features/regulated-asset-inspector/lib/format";
import { readHomeDomain, stellarTomlUrl } from "@/features/regulated-asset-inspector/lib/home-domain";
import { toRegulatedAssetInspectorErrorCode } from "@/features/regulated-asset-inspector/lib/regulatedAssetInspector.errors";
import {
  matchCurrency,
  parseRegulatedCurrencies
} from "@/features/regulated-asset-inspector/lib/regulated-fields";
import type {
  IssuerFlagEvidence,
  RegulatedAssetInspectorErrorCode,
  RegulatedAssetInspectorInput,
  RegulatedAssetInspectorResult
} from "@/features/regulated-asset-inspector/types";

export interface HorizonAccount {
  home_domain?: string | null;
  flags?: {
    auth_required?: boolean;
    auth_revocable?: boolean;
    auth_immutable?: boolean;
    auth_clawback_enabled?: boolean;
  };
}

export interface InspectDeps {
  loadAccount?: (issuerId: string, network: StellarNetwork) => Promise<HorizonAccount>;
  fetchImpl?: typeof fetch;
}

export async function runRegulatedAssetInspector(
  input: RegulatedAssetInspectorInput,
  network: StellarNetwork,
  signal?: AbortSignal,
  deps: InspectDeps = {}
): Promise<Result<RegulatedAssetInspectorResult, RegulatedAssetInspectorErrorCode>> {
  let account: HorizonAccount;
  try {
    account = await (deps.loadAccount ?? defaultLoadAccount)(input.issuerId, network);
  } catch (error) {
    return err(toRegulatedAssetInspectorErrorCode(error));
  }

  const homeDomain = readHomeDomain(account);
  if (!homeDomain.ok) return err(homeDomain.code);

  const tomlUrl = stellarTomlUrl(homeDomain.value);
  let rawToml: string;
  try {
    const response = await (deps.fetchImpl ?? globalThis.fetch)(tomlUrl, {
      signal,
      redirect: "manual",
      headers: { Accept: "text/plain, text/x-toml, */*" }
    });
    if (!response.ok || (response.status >= 300 && response.status < 400)) {
      return err("toml_unreachable");
    }
    rawToml = await response.text();
  } catch {
    return err("toml_unreachable");
  }

  let currencies;
  try {
    currencies = parseRegulatedCurrencies(rawToml);
  } catch {
    return err("malformed_toml");
  }

  const match = matchCurrency(currencies, input.assetCode, input.issuerId);
  if (!match) return err("currency_not_found");

  const approval = normalizeApproval(match);
  const regulatedStatus = match.regulated === true ? "regulated" : "not_regulated";

  return ok({
    issuerId: input.issuerId,
    assetCode: input.assetCode,
    homeDomain: homeDomain.value,
    tomlUrl,
    network,
    regulatedStatus,
    regulatedFieldPresent: match.regulatedFieldPresent,
    approvalServer: approval.approvalServer,
    approvalCriteria: approval.approvalCriteria,
    issuerFlags: flagsOf(account),
    selfPublishedNotice: SELF_PUBLISHED_NOTICE
  });
}

function flagsOf(account: HorizonAccount): IssuerFlagEvidence {
  return {
    authRequired: account.flags?.auth_required === true,
    authRevocable: account.flags?.auth_revocable === true,
    authImmutable: account.flags?.auth_immutable === true,
    authClawbackEnabled: account.flags?.auth_clawback_enabled === true
  };
}

async function defaultLoadAccount(issuerId: string, network: StellarNetwork): Promise<HorizonAccount> {
  return horizonServer(network).loadAccount(issuerId) as Promise<HorizonAccount>;
}
