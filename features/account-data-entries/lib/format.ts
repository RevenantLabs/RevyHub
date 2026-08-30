export function formatHex(value: string): string {
  return value.match(/.{1,2}/g)?.join(" ") ?? "";
}

export function formatByteCount(value: number): string {
  return `${value} byte${value === 1 ? "" : "s"}`;
}
