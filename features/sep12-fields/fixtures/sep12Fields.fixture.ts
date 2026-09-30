import type { Sep9Field } from "@/features/sep12-fields/types";

/**
 * A small, fixed field set for tests.
 *
 * Deliberately separate from the shipped table so a search test asserts on
 * behaviour rather than on whatever the catalogue happens to contain today,
 * and so adding a field to the real table cannot silently change a test's
 * meaning.
 */
export const testFields: readonly Sep9Field[] = [
  {
    name: "address_country_code",
    group: "natural_person",
    type: "country_code",
    description: "Country of the street address."
  },
  {
    name: "address",
    group: "natural_person",
    type: "string",
    description: "Street address of the customer."
  },
  {
    name: "first_name",
    group: "natural_person",
    type: "string",
    description: "Given name of the customer."
  },
  {
    name: "organization.VAT_number",
    group: "organization",
    type: "string",
    description: "VAT registration number."
  },
  {
    name: "organization.name",
    group: "organization",
    type: "string",
    description: "Legal name of the organization."
  },
  {
    name: "bank_account_number",
    group: "financial_account",
    type: "string",
    description: "Bank account number to settle to."
  }
];

/** A query that matches a canonical name in two different groups. */
export const crossGroupQuery = "address";

/** A query that matches only prose, never a canonical name. */
export const descriptionOnlyQuery = "street";

/** A query that matches nothing. */
export const noMatchQuery = "zzzz-not-a-field";
