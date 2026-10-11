import type { KycFieldDescription, KycFieldReference } from "@/features/sep12-kyc-reference/types";

export const SEP12_KYC_FIELDS: KycFieldDescription[] = [
  // Personal fields
  { name: "first_name", type: "string", description: "Customer's first/given name", required: true, category: "personal", examples: ["John", "Jane"] },
  { name: "last_name", type: "string", description: "Customer's last/family name", required: true, category: "personal", examples: ["Doe", "Smith"] },
  { name: "middle_name", type: "string", description: "Customer's middle name", required: false, category: "personal", examples: ["Michael", "Lee"] },
  { name: "email_address", type: "string", description: "Customer's email address", required: false, category: "personal", examples: ["user@example.com"] },
  { name: "phone_number", type: "string", description: "Customer's phone number", required: false, category: "personal", examples: ["+1234567890"] },
  { name: "date_of_birth", type: "date", description: "Customer's date of birth (YYYY-MM-DD)", required: false, category: "personal", examples: ["1990-01-15"] },
  { name: "id_number", type: "string", description: "Government-issued ID number", required: false, category: "personal", examples: ["AB1234567"] },
  { name: "id_type", type: "string", description: "Type of ID document", required: false, category: "personal", examples: ["passport", "drivers_license", "national_id"] },
  { name: "photo_id_front", type: "binary", description: "Front photo of ID document", required: false, category: "personal", examples: ["[binary data]"] },
  { name: "photo_id_back", type: "binary", description: "Back photo of ID document", required: false, category: "personal", examples: ["[binary data]"] },
  { name: "ip_address", type: "string", description: "Customer's IP address", required: false, category: "personal", examples: ["192.168.1.1"] },
  { name: "photo_proof_residence", type: "binary", description: "Proof of residence document", required: false, category: "personal", examples: ["[binary data]"] },
  { name: "non_customer", type: "boolean", description: "Whether the customer is not a customer of the anchor", required: false, category: "personal", examples: ["true", "false"] },
  { name: "searchable", type: "boolean", description: "Whether this record should be searchable", required: false, category: "personal", examples: ["true", "false"] },
  // Entity fields
  { name: "organization", type: "string", description: "Organization name", required: false, category: "entity", examples: ["Acme Corp"] },
  { name: "address_country_code", type: "string", description: "Country code of address (ISO 3166-1 alpha-2)", required: false, category: "entity", examples: ["US", "GB", "DE"] },
  { name: "state_or_province", type: "string", description: "State or province", required: false, category: "entity", examples: ["California", "Ontario"] },
  { name: "city", type: "string", description: "City name", required: false, category: "entity", examples: ["New York", "London"] },
  { name: "address", type: "string", description: "Full street address", required: false, category: "entity", examples: ["123 Main St"] },
  { name: "postal_code", type: "string", description: "Postal/ZIP code", required: false, category: "entity", examples: ["90210", "SW1A 1AA"] },
  // Organization fields
  { name: "organization_name", type: "string", description: "Registered organization name", required: false, category: "organization", examples: ["Acme Corporation"] },
  { name: "organization_vat_number", type: "string", description: "VAT/Tax identification number", required: false, category: "organization", examples: ["DE123456789"] },
  { name: "organization_registration_number", type: "string", description: "Company registration number", required: false, category: "organization", examples: ["REG12345"] },
  { name: "organization_type", type: "string", description: "Type of organization", required: false, category: "organization", examples: ["llc", "corporation", "partnership"] },
];

export function getKycFieldReference(): KycFieldReference {
  const byCategory = {
    personal: SEP12_KYC_FIELDS.filter(f => f.category === "personal"),
    entity: SEP12_KYC_FIELDS.filter(f => f.category === "entity"),
    organization: SEP12_KYC_FIELDS.filter(f => f.category === "organization"),
  };
  return { fields: SEP12_KYC_FIELDS, byCategory };
}

export function searchKycFields(
  query: string,
  category?: string
): KycFieldDescription[] {
  let results = SEP12_KYC_FIELDS;

  if (category && category !== "all") {
    results = results.filter(f => f.category === category);
  }

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      f =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q)
    );
  }

  return results;
}
