import type { StellarNetwork } from "@/core/network/types";
import type { EventRow } from "../types";

export const testnet = "testnet" as StellarNetwork;
export const mainnet = "mainnet" as StellarNetwork;

export function row(id: string): EventRow {
  return { id, type: "contract", ledger: "150", contractId: "C", topics: ["symbol transfer"], value: "u32 7" };
}

export const firstPage = { network: testnet, rows: [row("a")], cursor: "cursor-a" };
export const secondPage = { network: testnet, rows: [row("b")], cursor: "cursor-b" };
export const otherNetworkPage = { network: mainnet, rows: [row("c")], cursor: "cursor-c" };
