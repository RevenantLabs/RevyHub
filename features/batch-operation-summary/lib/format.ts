export function formatNativeAmount(stroops: string): string {
  const value = BigInt(stroops);
  const whole = value / 10_000_000n;
  const fraction = (value % 10_000_000n).toString().padStart(7, "0").replace(/0+$/, "");
  return `${whole}${fraction ? `.${fraction}` : ""} XLM`;
}

export function formatOperationType(type: string): string {
  return type.replace(/^op/, "").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}
