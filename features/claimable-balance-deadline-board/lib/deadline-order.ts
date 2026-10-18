import type { DeadlineRow } from "../types";
export function orderDeadlines(rows: DeadlineRow[]): { dated: DeadlineRow[]; undated: DeadlineRow[] } {
  const dated = rows.filter((row) => row.deadline).sort((a, b) =>
    Date.parse(a.deadline!) - Date.parse(b.deadline!) || a.id.localeCompare(b.id));
  const undated = rows.filter((row) => !row.deadline).sort((a, b) => a.id.localeCompare(b.id));
  return { dated, undated };
}
