import type { TomlCurrency } from "@/features/asset-metadata/types";

export function formatAssetIdentity(currency: TomlCurrency): string {
  return currency.issuer ? `${currency.code}:${currency.issuer}` : currency.code;
}

/** Fields a SEP-0001 entry may declare but often omits. */
export function declaredFields(currency: TomlCurrency): Array<{ label: string; value: string }> {
  const fields: Array<{ label: string; value: string | undefined }> = [
    { label: "Name", value: currency.name },
    { label: "Description", value: currency.desc },
    { label: "Home domain", value: currency.homeDomain },
    { label: "Image", value: currency.image }
  ];

  return fields.map((field) => ({
    label: field.label,
    value: field.value?.trim() ? field.value : "Not declared"
  }));
}

export function formatFetchedAt(iso: string): string {
  return iso.replace("T", " ").replace(/\.\d+Z$/, " UTC");
}

/** True when the entry names an asset but no issuer to pin it to. */
export function isUnpinned(currency: TomlCurrency): boolean {
  return !currency.issuer;
}
