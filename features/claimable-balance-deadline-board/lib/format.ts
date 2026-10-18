/** Keep Stellar's seven decimal places as text so large amounts stay exact. */
export function formatBalanceAmount(amount: string): string {
  const [whole, fraction = ""] = amount.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmed = fraction.replace(/0+$/, "");
  return trimmed ? `${grouped}.${trimmed}` : grouped;
}
export function formatDeadline(instant: string): string { return new Date(instant).toISOString().replace("T", " ").replace(".000Z", " UTC"); }
export function formatBalanceAsset(asset: string): string { return asset === "native" ? "XLM" : asset; }
