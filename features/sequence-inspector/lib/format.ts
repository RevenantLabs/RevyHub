/** BigInt renders decimal digits exactly and never uses scientific notation. */
export function formatSequence(value: bigint): string {
  return value.toString(10);
}

export function formatBitPart(value: bigint): string {
  return `${formatSequence(value)} (0x${value.toString(16).padStart(8, "0")})`;
}

export function formatIncrease(value: bigint): string {
  return `+${formatSequence(value)}`;
}
