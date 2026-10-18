import { copy, errorCopy } from "../copy";
import type { AccountRow } from "../types";
export function AccountStatus({ accounts }: { accounts: AccountRow[] }) {
  return <section aria-labelledby="account-status-title">
    <h3 id="account-status-title" className="mb-3 font-bold">{copy.accountStatusTitle}</h3>
    <ul className="space-y-2">{accounts.map((account) => <li key={account.accountId}
      className="flex flex-wrap gap-2 text-sm">
      <span className="break-all font-mono">{account.accountId}</span>
      <span>{account.status === "success" ? copy.successStatus : errorCopy[account.code].title}</span>
      {account.status === "error" && <span>{errorCopy[account.code].description}</span>}
    </li>)}</ul>
  </section>;
}
