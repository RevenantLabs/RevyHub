import { horizonUrl } from "@/core/horizon/client";
import { runHorizonRequest } from "@/core/horizon/request";
import { ok, err, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { record, unsigned, integerString } from "../schema";
import { failedColumn } from "./networkComparison.errors";
import type { NetworkComparisonResult, NetworkComparisonErrorCode, NetworkColumn } from "../types";
async function observe(network: StellarNetwork, signal?: AbortSignal): Promise<NetworkColumn> {
 try {
  return await runHorizonRequest((async (): Promise<NetworkColumn> => {
   const read = async (url: string): Promise<unknown> => {const r = await fetch(url,{signal});if(!r.ok) throw {status:r.status}; return r.json();};
   const [rootValue,pageValue] = await Promise.all([read(horizonUrl(network,"/")),read(horizonUrl(network,"/ledgers",{order:"desc",limit:1}))]);
   const root = record(rootValue); const page = record(pageValue); const records = record(page?._embedded)?.records;
   if (!root || !Array.isArray(records) || records.length !== 1 || typeof root.horizon_version !== "string") return failedColumn();
   const ledger = record(records[0]); if(!ledger) return failedColumn();
   const coreLatest = unsigned(root.core_latest_ledger); const historyLatest = unsigned(root.history_latest_ledger);
   return ok({observedAt:new Date().toISOString(),ledger:unsigned(ledger.sequence),protocol:unsigned(ledger.protocol_version),baseFee:integerString(ledger.base_fee_in_stroops),baseReserve:integerString(ledger.base_reserve_in_stroops),coreLatest,historyLatest,lag:coreLatest === null || historyLatest === null ? null : Math.max(0,coreLatest-historyLatest)});
  })(),{signal});
 } catch {return failedColumn();}
}
export async function runNetworkComparison(signal?: AbortSignal): Promise<Result<NetworkComparisonResult,NetworkComparisonErrorCode>> {
 const [testnet,mainnet] = await Promise.all([observe("testnet",signal),observe("mainnet",signal)]);
 if (!testnet.ok && !mainnet.ok) return err("both_unreachable");
 const differs = (field:"protocol"|"baseFee"|"baseReserve"):boolean|null => testnet.ok && mainnet.ok && testnet.value[field] !== null && mainnet.value[field] !== null ? testnet.value[field] !== mainnet.value[field] : null;
 return ok({testnet,mainnet,partial:!testnet.ok || !mainnet.ok,protocolDiffers:differs("protocol"),feeDiffers:differs("baseFee"),reserveDiffers:differs("baseReserve")});
}
