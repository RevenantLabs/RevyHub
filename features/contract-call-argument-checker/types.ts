export type RawInput = Record<string, string>;

export type ErrorCode =
  | "invalid_spec_xdr"
  | "unknown_function"
  | "invalid_arg_xdr"
  | "argument_count_mismatch"
  | "unsupported_spec_type"
  | "too_large";

export interface TypeNode {
  kind: string;
  name?: string;
  items?: TypeNode[];
  fields?: Array<{ name: string; type: TypeNode }>;
}

export interface SpecInput {
  name: string;
  type: TypeNode;
}

export interface SpecFunction {
  name: string;
  inputs: SpecInput[];
}

export interface SpecModel {
  functions: SpecFunction[];
  structs: Array<{ name: string; fields: Array<{ name: string; type: TypeNode }> }>;
}

export interface Mismatch {
  path: string;
  expected: string;
  actual: string;
}

export interface ArgumentReport {
  functionNames: string[];
  selected: string;
  expected: string[];
  actual: string[];
  mismatches: Mismatch[];
}
