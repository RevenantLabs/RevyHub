/** Calculation mode for the tool. */
export type HashCalculatorMode = "data" | "transaction";

/** Encodings supported for arbitrary data input. */
export type DataEncoding = "utf8" | "hex" | "base64";

/** Network passphrase preset options. */
export type NetworkPassphrasePreset = "testnet" | "public" | "custom";

/** Input structure for arbitrary data hashing. */
export interface DataHashInput {
  mode: "data";
  data: string;
  encoding: DataEncoding;
}

/** Input structure for transaction envelope hashing. */
export interface TransactionHashInput {
  mode: "transaction";
  envelope: string;
  passphrasePreset: NetworkPassphrasePreset;
  customPassphrase?: string;
  resolvedPassphrase: string;
}

/** Discriminated union of valid inputs. */
export type HashCalculatorInput = DataHashInput | TransactionHashInput;

/** Result structure for arbitrary data hashing. */
export interface DataHashResult {
  mode: "data";
  encoding: DataEncoding;
  inputByteLength: number;
  hashHex: string;
  hashBase64: string;
}

/** Result structure for transaction envelope hashing. */
export interface TransactionHashResult {
  mode: "transaction";
  selectedPreset: NetworkPassphrasePreset;
  selectedPassphrase: string;
  hashHex: string;
  hashBase64: string;
  testnetHashHex: string;
  testnetHashBase64: string;
  publicHashHex: string;
  publicHashBase64: string;
  envelopeType: string;
  operationCount: number;
  hasDifferentStandardHashes: boolean;
}

/** Discriminated union of calculation results. */
export type HashCalculatorResult = DataHashResult | TransactionHashResult;

/** Error codes defined for the feature contract. */
export type HashCalculatorErrorCode =
  | "empty_input"
  | "invalid_encoding"
  | "invalid_xdr"
  | "empty_passphrase"
  | "crypto_unavailable"
  | "request_failed";
