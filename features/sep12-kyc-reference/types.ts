export type KycFieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "binary"
  | "array"
  | "object";

export type KycFieldType_enum =
  | "personal"
  | "entity"
  | "organization";

export interface KycFieldDescription {
  name: string;
  type: KycFieldType;
  description: string;
  required: boolean;
  category: KycFieldType_enum;
  examples?: string[];
}

export interface KycFieldReference {
  fields: KycFieldDescription[];
  byCategory: Record<KycFieldType_enum, KycFieldDescription[]>;
}

export type Sep12ErrorCode =
  | "empty_input"
  | "field_not_found"
  | "invalid_filter";
