/** Friendbot funds every new account with the same starting balance. */
export const STARTING_BALANCE = "10,000 XLM";

export function formatLedger(ledger?: number): string {
  return ledger === undefined ? "Not reported" : String(ledger);
}

export function explorerUrl(accountId: string): string {
  return `https://stellar.expert/explorer/testnet/account/${accountId}`;
}
