export type MuxedAccountCodecMode = "decode" | "encode";

export type MuxedAccountCodecErrorCode =
  | "empty_input"
  | "invalid_muxed_address"
  | "invalid_base_address"
  | "invalid_id";

export interface MuxedAccountCodecInput {
  mode: MuxedAccountCodecMode;
  muxedAddress?: string;
  baseAddress?: string;
  id?: string;
}

export interface RawMuxedAccountCodecInput {
  mode: MuxedAccountCodecMode;
  muxedAddress?: string;
  baseAddress?: string;
  id?: string;
}

export interface MuxedAccountCodecResult {
  mode: MuxedAccountCodecMode;
  muxedAddress: string;
  baseAddress: string;
  id: string;
}
