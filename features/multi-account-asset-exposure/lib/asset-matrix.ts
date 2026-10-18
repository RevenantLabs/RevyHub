import type { AccountRow, MatrixRow } from "../types";
import { fromStroops, toStroops } from "./format";
/** Asset identity includes issuer; input account order is stable. */
export function buildAssetMatrix(accounts: AccountRow[]): MatrixRow[] {
  const rows = new Map<string, MatrixRow>();
  accounts.forEach((account, index) => {
    if (account.status !== "success") return;
    for (const balance of account.balances) {
      const key = `${balance.kind}:${balance.code}:${balance.issuer}`;
      let row = rows.get(key);
      if (!row) {
        row = { kind: balance.kind, code: balance.code, issuer: balance.issuer, balances: Array(accounts.length).fill(null), total: "0" };
        rows.set(key, row);
      }
      const amount = toStroops(balance.balance);
      row.balances[index] = fromStroops(toStroops(row.balances[index] ?? "0") + amount);
      row.total = fromStroops(toStroops(row.total) + amount);
    }
  });
  return [...rows.values()].sort((a, b) =>
    (a.kind === "native" ? -1 : 1) - (b.kind === "native" ? -1 : 1) ||
    a.code.localeCompare(b.code) || a.issuer.localeCompare(b.issuer)
  );
}
