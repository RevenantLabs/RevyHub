import type { copy } from "./copy";
export type RawInput = Record<string,string>;
export type Label = keyof typeof copy.labels;
export interface Report { values: Partial<Record<Label,string>>; rows?: Array<{id:string;kind:string;values:Partial<Record<Label,string>>}>; export?: unknown; }
export type ErrorCode = "empty_input" | "invalid_input" | "input_too_large" | "out_of_range" | "zero_denominator";
export interface Input {n:bigint;d:bigint;precision:number}
