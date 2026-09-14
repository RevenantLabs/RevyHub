export function formatCursor(cursor: string | undefined): string {
  if (!cursor) return "—";
  if (cursor.length <= 20) return cursor;
  return `${cursor.slice(0, 8)}...${cursor.slice(-8)}`;
}

export function formatCount(count: number): string {
  return count.toLocaleString();
}

export function formatBoolean(value: boolean): string {
  return value ? "Yes" : "No";
}
