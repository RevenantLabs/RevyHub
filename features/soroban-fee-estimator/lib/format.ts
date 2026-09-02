/** Convert stroops to XLM string with 7 decimals. */
export function formatXlm(stroops: bigint): string {
  const sign = stroops < 0n ? "-" : "";
  const abs = stroops < 0n ? -stroops : stroops;
  const str = abs.toString().padStart(8, "0");
  const integer = str.slice(0, -7) || "0";
  const fractional = str.slice(-7);
  return `${sign}${integer}.${fractional}`;
}

/** Format a component count with its unit. */
export function formatCount(count: bigint, name: string): string {
  if (name === "instructions") return `${count.toLocaleString()} instructions`;
  if (name === "ledger-read" || name === "ledger-write") return `${count.toLocaleString()} entries`;
  return `${count.toLocaleString()} bytes`;
}
