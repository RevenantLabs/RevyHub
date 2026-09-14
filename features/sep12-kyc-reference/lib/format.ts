import type { KycFieldDescription, KycFieldType_enum } from "@/features/sep12-kyc-reference/types";

export function formatFieldType(type: string): string {
  const labels: Record<string, string> = {
    string: "String",
    number: "Number",
    boolean: "Boolean",
    date: "Date (YYYY-MM-DD)",
    binary: "Binary (file)",
    array: "Array",
    object: "Object",
  };
  return labels[type] ?? type;
}

export function formatCategory(category: KycFieldType_enum): string {
  const labels: Record<KycFieldType_enum, string> = {
    personal: "Personal",
    entity: "Entity",
    organization: "Organization",
  };
  return labels[category] ?? category;
}

export function formatRequired(required: boolean): string {
  return required ? "Yes" : "No";
}

export function formatExamples(examples?: string[]): string {
  if (!examples || examples.length === 0) return "—";
  return examples.join(", ");
}
