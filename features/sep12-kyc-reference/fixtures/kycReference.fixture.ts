import type { KycFieldDescription } from "@/features/sep12-kyc-reference/types";

export const sampleKycField: KycFieldDescription = {
  name: "first_name",
  type: "string",
  description: "Customer's first/given name",
  required: true,
  category: "personal",
  examples: ["John", "Jane"],
};

export const sampleEntityField: KycFieldDescription = {
  name: "address_country_code",
  type: "string",
  description: "Country code of address (ISO 3166-1 alpha-2)",
  required: false,
  category: "entity",
  examples: ["US", "GB"],
};

export const sampleOrganizationField: KycFieldDescription = {
  name: "organization_name",
  type: "string",
  description: "Registered organization name",
  required: false,
  category: "organization",
  examples: ["Acme Corporation"],
};
