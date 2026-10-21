export type ErrorCode =
  | "empty_xdr"
  | "invalid_xdr"
  | "no_create_contract_operation"
  | "unsupported_preimage"
  | "too_large";

export interface ContractDeployPreviewInput {
  envelope: string;
}

export type PreimageSource =
  | { kind: "address"; address: string; saltHex: string }
  | { kind: "asset"; asset: string };

export type ExecutableSummary = { kind: "wasm"; hashHex: string } | { kind: "stellar_asset" };

export interface ConstructorArgSummary {
  index: number;
  scValType: string;
  display: string;
}

export interface ContractDeployPreview {
  isV2: boolean;
  preimage: PreimageSource;
  executable: ExecutableSummary;
  constructorArgs: ConstructorArgSummary[];
}
