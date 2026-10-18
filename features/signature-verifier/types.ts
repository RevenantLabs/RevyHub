export type MessageEncoding = "utf8" | "hex" | "base64";
export type SignatureEncoding = "hex" | "base64";
export interface SignatureVerifierInput {
  publicKey: string;
  message: string;
  signature: string;
  messageEncoding: MessageEncoding;
  signatureEncoding: SignatureEncoding;
}
export interface SignatureVerifierResult {
  summary: string;
  verified: boolean;
  publicKey: string;
  messageEncoding: MessageEncoding;
  signatureEncoding: SignatureEncoding;
  signatureBytes: number;
  explanation: string;
}

export type SignatureVerifierErrorCode =
  | "empty_input"
  | "empty_public_key"
  | "invalid_public_key"
  | "empty_message"
  | "empty_signature"
  | "invalid_signature_format"
  | "invalid_message_encoding"
  | "request_failed";
