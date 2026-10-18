import type { NetworkColumn } from "../types";
/** A failed root/ledger pair invalidates only its own column. */
export function failedColumn(): NetworkColumn {return {ok:false,code:"request_failed"};}
