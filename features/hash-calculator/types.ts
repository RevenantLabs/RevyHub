import type { copy } from "./copy";
export type RawInput = Record<string,string>;
export type Label = keyof typeof copy.labels;
export interface Report { values: Partial<Record<Label,string>>; rows?: Array<{id:string;kind:string;values:Partial<Record<Label,string>>}>; export?: unknown; }
export type ErrorCode = "empty_input" | "invalid_encoding" | "invalid_xdr" | "empty_passphrase" | "crypto_unavailable";
export type Input = {mode:"SHA-256";bytes:Uint8Array}|{mode:"Transaction";value:string;passphrase:string};
