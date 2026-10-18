import type { copy } from "./copy";
export type RawInput = Record<string,string>;
export type Label = keyof typeof copy.labels;
export interface Report { values: Partial<Record<Label,string>>; rows?: Array<{id:string;kind:string;values:Partial<Record<Label,string>>}>; export?: unknown; }
export type ErrorCode = "empty_input" | "invalid_input" | "input_too_large" | "unsupported_balance_type" | "incomplete_snapshot" | "invalid_limit";
export interface Input {code:string;issuer:string;balance:bigint;limit:bigint;buying:bigint;selling:bigint;proposed:bigint;authorized?:boolean;maintain?:boolean;clawback?:boolean}
