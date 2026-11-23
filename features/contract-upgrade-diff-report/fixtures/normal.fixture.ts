import { xdr } from "@stellar/stellar-sdk";

/**
 * Deterministic Wasm modules assembled byte by byte.
 *
 * Every custom-section payload is produced by the installed SDK's own XDR
 * encoders, so the fixtures are protocol-correct by construction rather than
 * hand-typed hex. The modules contain no code at all — which is still a valid
 * Wasm module and is all this tool ever reads.
 */

const WASM_HEADER = [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00];

export function uleb(value: number): number[] {
  const out: number[] = [];
  let rest = value;
  do {
    let byte = rest % 128;
    rest = Math.floor(rest / 128);
    if (rest > 0) byte |= 0x80;
    out.push(byte);
  } while (rest > 0);
  return out;
}

export function customSection(name: string, payload: Uint8Array | number[]): number[] {
  const nameBytes = [...new TextEncoder().encode(name)];
  const body = [...uleb(nameBytes.length), ...nameBytes, ...payload];
  return [0x00, ...uleb(body.length), ...body];
}

/** An empty type section (id 1) so the reader has a standard section to skip. */
export const EMPTY_TYPE_SECTION = [0x01, 0x01, 0x00];

export function wasmModule(...sections: number[][]): Uint8Array {
  return Uint8Array.from([...WASM_HEADER, ...EMPTY_TYPE_SECTION, ...sections.flat()]);
}

export function concat(...parts: (Buffer | number[])[]): number[] {
  return parts.flatMap((part) => [...part]);
}

const t = xdr.ScSpecTypeDef;

export const types = {
  address: () => t.scSpecTypeAddress(),
  i128: () => t.scSpecTypeI128(),
  u32: () => t.scSpecTypeU32(),
  u64: () => t.scSpecTypeU64(),
  bool: () => t.scSpecTypeBool(),
  udt: (name: string) => t.scSpecTypeUdt(new xdr.ScSpecTypeUdt({ name })),
  option: (valueType: xdr.ScSpecTypeDef) => t.scSpecTypeOption(new xdr.ScSpecTypeOption({ valueType })),
  result: (okType: xdr.ScSpecTypeDef, errorType: xdr.ScSpecTypeDef) =>
    t.scSpecTypeResult(new xdr.ScSpecTypeResult({ okType, errorType })),
  vec: (elementType: xdr.ScSpecTypeDef) => t.scSpecTypeVec(new xdr.ScSpecTypeVec({ elementType })),
  map: (keyType: xdr.ScSpecTypeDef, valueType: xdr.ScSpecTypeDef) =>
    t.scSpecTypeMap(new xdr.ScSpecTypeMap({ keyType, valueType })),
  bytesN: (n: number) => t.scSpecTypeBytesN(new xdr.ScSpecTypeBytesN({ n })),
  void: () => t.scSpecTypeVoid()
};

export function fn(
  name: string,
  inputs: [string, xdr.ScSpecTypeDef][],
  outputs: xdr.ScSpecTypeDef[] = [],
  doc = ""
): Buffer {
  return xdr.ScSpecEntry.scSpecEntryFunctionV0(
    new xdr.ScSpecFunctionV0({
      doc,
      name,
      inputs: inputs.map(([inputName, type]) => new xdr.ScSpecFunctionInputV0({ doc: "", name: inputName, type })),
      outputs
    })
  ).toXDR();
}

export function struct(name: string, fields: [string, xdr.ScSpecTypeDef][]): Buffer {
  return xdr.ScSpecEntry.scSpecEntryUdtStructV0(
    new xdr.ScSpecUdtStructV0({
      doc: "",
      lib: "",
      name,
      fields: fields.map(([fieldName, type]) => new xdr.ScSpecUdtStructFieldV0({ doc: "", name: fieldName, type }))
    })
  ).toXDR();
}

export function errorEnum(name: string, cases: [string, number][]): Buffer {
  return xdr.ScSpecEntry.scSpecEntryUdtErrorEnumV0(
    new xdr.ScSpecUdtErrorEnumV0({
      doc: "",
      lib: "",
      name,
      cases: cases.map(([caseName, value]) => new xdr.ScSpecUdtErrorEnumCaseV0({ doc: "", name: caseName, value }))
    })
  ).toXDR();
}

export function envMeta(protocol: number, preRelease = 0): Buffer {
  return xdr.ScEnvMetaEntry.scEnvMetaKindInterfaceVersion(
    new xdr.ScEnvMetaEntryInterfaceVersion({ protocol, preRelease })
  ).toXDR();
}

export function meta(key: string, val: string): Buffer {
  return xdr.ScMetaEntry.scMetaV0(new xdr.ScMetaV0({ key, val })).toXDR();
}

/* ----------------------------------------------------------------------------
 * The normal upgrade: a token contract moving from protocol 21 to 22.
 *
 * Exactly these differences, and nothing else:
 *   - fn `transfer` now returns Result<(), TokenError> instead of ()   → changed
 *   - fn `legacy_mint` is gone                                          → removed
 *   - fn `burn` is new                                                  → added
 *   - struct `Config.fee_bps` widened from u32 to u64                   → changed
 *   - error `TokenError` gains `Paused = 3`                             → changed
 *   - `init`, `balance` and the `Token` struct are untouched            → unchanged
 *   - environment protocol 21 → 22
 *   - metadata `rsver` and `rssdkver` changed, `source_repo` added
 * ------------------------------------------------------------------------- */

const oldSpec = concat(
  fn("init", [["admin", types.address()]], [], "Initialise the contract."),
  fn("transfer", [
    ["from", types.address()],
    ["to", types.address()],
    ["amount", types.i128()]
  ]),
  fn("balance", [["id", types.address()]], [types.i128()]),
  fn("legacy_mint", [
    ["to", types.address()],
    ["amount", types.i128()]
  ]),
  struct("Config", [
    ["admin", types.address()],
    ["fee_bps", types.u32()]
  ]),
  struct("Token", [
    ["decimals", types.u32()],
    ["hash", types.bytesN(32)]
  ]),
  errorEnum("TokenError", [
    ["InsufficientBalance", 1],
    ["Unauthorized", 2]
  ])
);

const newSpec = concat(
  // The doc string changed too; docs are not part of the comparison.
  fn("init", [["admin", types.address()]], [], "Initialise the contract once."),
  fn(
    "transfer",
    [
      ["from", types.address()],
      ["to", types.address()],
      ["amount", types.i128()]
    ],
    [types.result(types.void(), types.udt("TokenError"))]
  ),
  fn("balance", [["id", types.address()]], [types.i128()]),
  fn("burn", [
    ["from", types.address()],
    ["amount", types.i128()]
  ]),
  // Same fields declared in a different order: encoded by name, so unchanged.
  struct("Token", [
    ["hash", types.bytesN(32)],
    ["decimals", types.u32()]
  ]),
  struct("Config", [
    ["admin", types.address()],
    ["fee_bps", types.u64()]
  ]),
  errorEnum("TokenError", [
    ["InsufficientBalance", 1],
    ["Unauthorized", 2],
    ["Paused", 3]
  ])
);

export const oldWasm = wasmModule(
  customSection("contractenvmetav0", envMeta(21)),
  customSection("contractmetav0", concat(meta("rsver", "1.79.0"), meta("rssdkver", "21.7.0"))),
  customSection("contractspecv0", oldSpec)
);

export const newWasm = wasmModule(
  customSection("contractenvmetav0", envMeta(22)),
  customSection(
    "contractmetav0",
    concat(
      meta("rsver", "1.81.0"),
      meta("rssdkver", "22.0.0"),
      meta("source_repo", "https://example.invalid/token")
    )
  ),
  customSection("contractspecv0", newSpec)
);

/** The declarations the normal pair must report, by stable key, and nothing more. */
export const expectedStatuses = {
  "function:balance": "unchanged",
  "function:burn": "added",
  "function:init": "unchanged",
  "function:legacy_mint": "removed",
  "function:transfer": "changed",
  "type:Config": "changed",
  "type:Token": "unchanged",
  "error:TokenError": "changed"
} as const;

export function wasmFile(bytes: Uint8Array, name: string): File {
  return new File([bytes as BlobPart], name, { type: "application/wasm" });
}
