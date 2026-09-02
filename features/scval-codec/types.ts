export type ScvalCodecMode = "decode" | "encode";

export interface ScvalCodecInput {
  value: string;
  mode: ScvalCodecMode;
}

export type ScvalJson =
  | null
  | boolean
  | number
  | string
  | ScvalJsonTagged
  | ScvalJson[];

export interface ScvalJsonTagged {
  _type:
    | "u32"
    | "i32"
    | "u64"
    | "i64"
    | "timepoint"
    | "duration"
    | "u128"
    | "i128"
    | "u256"
    | "i256"
    | "bytes"
    | "symbol"
    | "address"
    | "error"
    | "vec"
    | "map";
  value: unknown;
}

export interface ScvalCodecDecodedResult {
  mode: "decode";
  input: string;
  output: string;
  json: ScvalJson;
}

export interface ScvalCodecEncodedResult {
  mode: "encode";
  input: string;
  output: string;
  base64: string;
}

export type ScvalCodecResult = ScvalCodecDecodedResult | ScvalCodecEncodedResult;

export type ScvalCodecErrorCode =
  | "empty_input"
  | "invalid_base64"
  | "invalid_scval"
  | "invalid_json"
  | "unsupported_type"
  | "request_failed";
