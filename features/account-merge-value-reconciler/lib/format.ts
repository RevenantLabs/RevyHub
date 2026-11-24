/** Format an integer number of stroops without a floating-point conversion. */
export function formatStroops(value: string): string {
  const amount = BigInt(value);
  const sign = amount < 0n ? "-" : "";
  const absolute = amount < 0n ? -amount : amount;
  return `${sign}${absolute / 10_000_000n}.${(absolute % 10_000_000n).toString().padStart(7, "0")}`;
}

export function formatIdentity(address: string): string {
  return address;
}
