import { err, ok, type Result } from "@/core/result/result";
import type { HorizonUrlErrorCode } from "@/features/horizon-url-builder/types";

const VALID_RESOURCES = ["accounts", "transactions", "operations", "payments", "offers", "trades", "liquidity_pools", "assets", "order_book"];
const VALID_NETWORKS = ["mainnet", "testnet"];

export function parseHorizonUrlConfig(body: any): Result<any, HorizonUrlErrorCode> {
  if (!body?.resource) return err("empty_input");
  if (!VALID_RESOURCES.includes(body.resource)) return err("invalid_resource");
  if (!VALID_NETWORKS.includes(body.network)) return err("invalid_network");
  return ok(body);
}
