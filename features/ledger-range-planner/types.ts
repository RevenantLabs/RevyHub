import type { copy } from "./copy";
export type RawInput = Record<string,string>;
export type Label = keyof typeof copy.labels;
export interface Report { values: Partial<Record<Label,string>>; rows?: Array<{id:string;kind:string;values:Partial<Record<Label,string>>}>; export?: unknown; }
export type ErrorCode = "empty_input" | "invalid_input" | "input_too_large" | "reversed_range" | "invalid_retention" | "too_many_chunks";
export interface Input {start:bigint;end:bigint;chunk:bigint;oldest:bigint|null;latest:bigint|null;scope:"Requested range"|"Retained intersection"}
