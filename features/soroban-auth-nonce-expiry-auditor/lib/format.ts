import type { AuditRow } from "../types";
import { copy } from "../copy";
export function formatIdentity(row: AuditRow): string { return row.credential === "address" ? row.address! : copy.sourceIdentity; }
export function formatNonce(nonce: string | null): string { return nonce ?? copy.sourceNonceUnavailable; }
export function formatLedger(ledger: number | null): string { return ledger === null ? copy.ledgerNotSupplied : String(ledger); }
