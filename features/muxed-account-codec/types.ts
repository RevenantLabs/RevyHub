import type { copy } from "./copy";
export type RawInput = Record<string,string>;
export type Label = keyof typeof copy.labels;
export interface Report { values: Partial<Record<Label,string>>; rows?: Array<{id:string;kind:string;values:Partial<Record<Label,string>>}>; export?: unknown; }
export type ErrorCode = "empty_input" | "invalid_muxed_address" | "invalid_base_address" | "invalid_id";
export type Input = {mode:"Decode";muxed:string}|{mode:"Encode";base:string;id:string};
