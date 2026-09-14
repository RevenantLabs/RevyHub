import { ok, err, type Result } from "@/core/result/result";
import type {
  BuiltHorizonUrl,
  HorizonNetwork,
  HorizonResource,
  HorizonUrlConfig,
  HorizonUrlErrorCode,
} from "@/features/horizon-url-builder/types";

const HORIZON_URLS: Record<HorizonNetwork, string> = {
  mainnet: "https://horizon.stellar.org",
  testnet: "https://horizon-testnet.stellar.org",
};

const VALID_RESOURCES: HorizonResource[] = [
  "accounts", "transactions", "operations", "payments",
  "offers", "trades", "liquidity_pools", "assets", "order_book",
];

export function buildHorizonUrl(
  config: HorizonUrlConfig
): Result<BuiltHorizonUrl, HorizonUrlErrorCode> {
  if (!config.resource) return err("empty_input");
  if (!VALID_RESOURCES.includes(config.resource)) return err("invalid_resource");
  if (!["mainnet", "testnet"].includes(config.network)) return err("invalid_network");

  const baseUrl = HORIZON_URLS[config.network];
  const params: Record<string, string> = {};

  let path = `/${config.resource}`;
  if (config.accountId) {
    path = `/${config.resource}/${config.accountId}`;
  }

  if (config.cursor) params.cursor = config.cursor;
  if (config.limit) params.limit = String(Math.min(200, Math.max(1, config.limit)));
  if (config.order) params.order = config.order;

  const queryString = new URLSearchParams(params).toString();
  const url = `${baseUrl}${path}${queryString ? "?" + queryString : ""}`;

  return ok({ url, resource: config.resource, network: config.network, params });
}

export function getValidResources(): HorizonResource[] {
  return [...VALID_RESOURCES];
}

export function getHorizonUrl(network: HorizonNetwork): string {
  return HORIZON_URLS[network];
}
