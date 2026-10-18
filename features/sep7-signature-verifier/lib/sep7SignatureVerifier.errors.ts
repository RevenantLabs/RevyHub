import type { Sep7SignatureVerifierErrorCode } from "@/features/sep7-signature-verifier/types";

export class Sep7TomlUnreachableError extends Error {
  constructor() {
    super("stellar.toml could not be fetched");
    this.name = "Sep7TomlUnreachableError";
  }
}

export class Sep7RequestFailedError extends Error {
  constructor(cause?: unknown) {
    super("request failed", { cause });
    this.name = "Sep7RequestFailedError";
  }
}

/** Maps transport failures onto this tool's own error codes. */
export function toSep7SignatureVerifierErrorCode(error: unknown): Sep7SignatureVerifierErrorCode {
  if (error instanceof Sep7TomlUnreachableError) return "toml_unreachable";
  return "request_failed";
}
