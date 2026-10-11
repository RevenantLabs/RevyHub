import type { Sep12ErrorCode } from "@/features/sep12-kyc-reference/types";

export const copy = {
  formLabel: "Search KYC fields",
  formHint: "Search by field name, type, or category. Leave empty to browse all.",
  submit: "Search",
  loading: "Searching...",
  emptyTitle: "No field selected",
  emptyDescription:
    "Search for a specific KYC field or browse the reference to see SEP-12 field definitions, types, and requirements.",
  resultTitle: "KYC Field Reference",
  filterLabel: "Filter by category",
  searchPlaceholder: "e.g. first_name, country, date_of_birth",
  fieldName: "Field Name",
  fieldType: "Type",
  fieldCategory: "Category",
  fieldRequired: "Required",
  fieldDescription: "Description",
  fieldExamples: "Examples",
  required: "Yes",
  optional: "No",
  categoryPersonal: "Personal",
  categoryEntity: "Entity",
  categoryOrganization: "Organization",
  allCategories: "All Categories",
  resultCount: "field(s) found",
} as const;

export const errorCopy: Record<
  Sep12ErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter a search term",
    description: "Search for a field name or leave empty to browse all fields.",
  },
  field_not_found: {
    title: "No matching fields found",
    description: "Try a different search term or browse all fields.",
  },
  invalid_filter: {
    title: "Invalid filter",
    description: "Select a valid category filter.",
  },
};
