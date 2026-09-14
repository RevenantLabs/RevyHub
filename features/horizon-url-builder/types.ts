export type HorizonResource =
  | "accounts"
  | "transactions"
  | "operations"
  | "payments"
  | "offers"
  | "trades"
  | "liquidity_pools"
  | "assets"
  | "order_book";

export type HorizonNetwork = "mainnet" | "testnet";

export interface HorizonUrlConfig {
  resource: HorizonResource;
  network: HorizonNetwork;
  accountId?: string;
  cursor?: string;
  limit?: number;
  order?: "asc" | "desc";
}

export interface BuiltHorizonUrl {
  url: string;
  resource: string;
  network: string;
  params: Record<string, string>;
}

export type HorizonUrlErrorCode =
  | "empty_input"
  | "invalid_resource"
  | "invalid_network";
