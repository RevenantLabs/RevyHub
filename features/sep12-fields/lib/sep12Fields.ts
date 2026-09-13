import type {
  FieldGroup,
  FieldMatch,
  Sep12FieldsResult,
  Sep9Field
} from "@/features/sep12-fields/types";

/**
 * A curated subset of the SEP-9 field set.
 *
 * SEP-9 is the authority: this table exists so a name can be checked and
 * copied without leaving the tool, and it deliberately covers the fields
 * integrations reach for most rather than claiming to be exhaustive. Each
 * entry states the name and the type the standard gives it. It does NOT state
 * which fields are required, because SEP-9 does not decide that — the anchor
 * decides it per customer request, and inventing a required/optional column
 * here would assert something the standard does not say.
 */
export const SEP9_FIELDS: readonly Sep9Field[] = [
  /* Natural person */
  { name: "first_name", group: "natural_person", type: "string", description: "Given name of the customer." },
  { name: "last_name", group: "natural_person", type: "string", description: "Family name of the customer." },
  { name: "additional_name", group: "natural_person", type: "string", description: "Middle name or any further given names." },
  { name: "email_address", group: "natural_person", type: "string", description: "Email address the anchor can reach the customer at." },
  { name: "mobile_number", group: "natural_person", type: "string", description: "Mobile phone number in E.164 format." },
  { name: "birth_date", group: "natural_person", type: "date", description: "Date of birth." },
  { name: "birth_place", group: "natural_person", type: "string", description: "Place of birth as text, not a coded country." },
  { name: "birth_country_code", group: "natural_person", type: "country_code", description: "Country of birth." },
  { name: "address", group: "natural_person", type: "string", description: "Street address of the customer." },
  { name: "address_country_code", group: "natural_person", type: "country_code", description: "Country of the street address." },
  { name: "state_or_province", group: "natural_person", type: "string", description: "State, province or region of the address." },
  { name: "city", group: "natural_person", type: "string", description: "City of the address." },
  { name: "postal_code", group: "natural_person", type: "string", description: "Postal or ZIP code." },
  { name: "tax_id", group: "natural_person", type: "string", description: "Tax identification number of the customer." },
  { name: "tax_id_name", group: "natural_person", type: "string", description: "Name of the tax identifier, for example the local shorthand." },
  { name: "occupation", group: "natural_person", type: "string", description: "Occupation of the customer." },
  { name: "employer_name", group: "natural_person", type: "string", description: "Name of the customer's employer." },
  { name: "employer_address", group: "natural_person", type: "string", description: "Address of the customer's employer." },
  { name: "language_code", group: "natural_person", type: "language_code", description: "Preferred language for contacting the customer." },
  { name: "id_type", group: "natural_person", type: "enum", description: "Kind of government identification supplied, for example passport or driving licence." },
  { name: "id_number", group: "natural_person", type: "string", description: "Number of the supplied identification document." },
  { name: "id_issue_date", group: "natural_person", type: "date", description: "Date the identification document was issued." },
  { name: "id_expiration_date", group: "natural_person", type: "date", description: "Date the identification document expires." },
  { name: "id_issuer", group: "natural_person", type: "string", description: "Authority that issued the identification document." },
  { name: "sex", group: "natural_person", type: "enum", description: "Sex of the customer as recorded on their identification." },
  { name: "photo_id_front", group: "natural_person", type: "binary", description: "Image of the front of the identification document." },
  { name: "photo_id_back", group: "natural_person", type: "binary", description: "Image of the back of the identification document." },
  { name: "notary_approval_of_photo_id", group: "natural_person", type: "binary", description: "Notarised approval of the identification images." },
  { name: "photo_proof_residence", group: "natural_person", type: "binary", description: "Image proving the customer's place of residence." },

  /* Organization */
  { name: "organization.name", group: "organization", type: "string", description: "Legal name of the organization." },
  { name: "organization.VAT_number", group: "organization", type: "string", description: "VAT registration number." },
  { name: "organization.registration_number", group: "organization", type: "string", description: "Company registration number." },
  { name: "organization.registered_address", group: "organization", type: "string", description: "Registered address of the organization." },
  { name: "organization.address_country_code", group: "organization", type: "country_code", description: "Country of the organization's address." },
  { name: "organization.state_or_province", group: "organization", type: "string", description: "State or province of the organization's address." },
  { name: "organization.city", group: "organization", type: "string", description: "City of the organization's address." },
  { name: "organization.postal_code", group: "organization", type: "string", description: "Postal code of the organization's address." },
  { name: "organization.number_of_shareholders", group: "organization", type: "string", description: "Count of shareholders in the organization." },
  { name: "organization.shareholder_name", group: "organization", type: "string", description: "Name of a shareholder. Repeated when there are several." },
  { name: "organization.director_name", group: "organization", type: "string", description: "Name of a director. Repeated when there are several." },
  { name: "organization.website", group: "organization", type: "string", description: "Public website of the organization." },
  { name: "organization.email", group: "organization", type: "string", description: "Contact email for the organization." },
  { name: "organization.phone", group: "organization", type: "string", description: "Contact phone number for the organization." },
  { name: "organization.photo_incorporation_doc", group: "organization", type: "binary", description: "Image of the certificate of incorporation." },
  { name: "organization.photo_proof_address", group: "organization", type: "binary", description: "Image proving the organization's address." },

  /* Financial account */
  { name: "bank_account_number", group: "financial_account", type: "string", description: "Bank account number to settle to." },
  { name: "bank_account_type", group: "financial_account", type: "enum", description: "Kind of bank account, for example checking or savings." },
  { name: "bank_name", group: "financial_account", type: "string", description: "Name of the bank holding the account." },
  { name: "bank_branch_number", group: "financial_account", type: "string", description: "Branch identifier of the bank account." }
];

/** The order groups are presented in, and the labels the UI resolves them to. */
export const GROUP_ORDER: readonly FieldGroup[] = [
  "natural_person",
  "organization",
  "financial_account"
];

/**
 * Ranks a field against a query.
 *
 * A canonical-name match outranks a description match, and the ranking is
 * returned rather than baked into a sort so the grouping pass can keep its own
 * order. The distinction matters because the failure this tool prevents is
 * someone using a near-miss *name*: those have to come first, ahead of the
 * larger set of fields that merely mention the word in prose.
 */
export function matchField(field: Sep9Field, query: string): FieldMatch | null {
  if (!query) return { field, nameMatch: true };

  const nameMatch = field.name.toLowerCase().includes(query);
  const descriptionMatch = field.description.toLowerCase().includes(query);

  if (!nameMatch && !descriptionMatch) return null;

  return { field, nameMatch };
}

function byName(a: FieldMatch, b: FieldMatch): number {
  return a.field.name.localeCompare(b.field.name);
}

/**
 * Searches the local field table.
 *
 * An empty query returns the whole set, because "show me everything" is a real
 * thing to want from a reference and treating it as an error would be
 * unhelpful. Groups with no matches are omitted rather than rendered empty, so
 * the result never implies a group was searched and found wanting when it was
 * never relevant to the query.
 */
export function searchFields(
  query: string,
  fields: readonly Sep9Field[] = SEP9_FIELDS
): Sep12FieldsResult {
  const matches: FieldMatch[] = [];

  for (const field of fields) {
    const match = matchField(field, query);
    if (match) matches.push(match);
  }

  const groups = GROUP_ORDER.map((group) => {
    const inGroup = matches.filter((match) => match.field.group === group);
    const nameMatches = inGroup.filter((match) => match.nameMatch).sort(byName);
    const rest = inGroup.filter((match) => !match.nameMatch).sort(byName);

    return { group, matches: nameMatches.concat(rest) };
  }).filter((entry) => entry.matches.length > 0);

  return {
    query,
    totalFields: fields.length,
    matchedFields: matches.length,
    groups
  };
}
