import { cereal, hash, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { hasWasmMagic, MAX_WASM_BYTES } from "@/features/contract-upgrade-diff-report/schema";
import {
  classifyDecodeFailure,
  UnsupportedVariantError,
  type DecodeFailure
} from "@/features/contract-upgrade-diff-report/lib/contractUpgradeDiffReport.errors";
import {
  METADATA_SECTIONS,
  type Declaration,
  type DeclarationPart,
  type EnvVersion,
  type MetadataEntry,
  type MetadataSection,
  type NameCollision,
  type SectionEvidence,
  type WasmInterface,
  type WasmUpload
} from "@/features/contract-upgrade-diff-report/types";

/** The only Wasm binary-format version this tool reads (core module, version 1). */
const WASM_VERSION_1 = [0x01, 0x00, 0x00, 0x00] as const;

/** Highest standard section id in the Wasm core spec (13 = tag). */
const MAX_STANDARD_SECTION_ID = 13;

/** Type nesting past this is refused rather than rendered. Real contracts stay far below it. */
export const MAX_TYPE_DEPTH = 32;

export interface CustomSection {
  name: string;
  /** Byte offset of the section id in the module, for diagnostics. */
  offset: number;
  payload: Uint8Array;
}

/**
 * Reads an unsigned LEB128 `u32`.
 *
 * At most five bytes; the fifth may only carry the top four bits and must not
 * set the continuation bit. Anything else is an over-long or overflowing
 * encoding and returns `null`. Arithmetic is done with multiplication rather
 * than bit shifts so values at or above 2^31 stay unsigned.
 */
export function readU32Leb(bytes: Uint8Array, start: number): { value: number; next: number } | null {
  let value = 0;
  for (let index = 0; index < 5; index++) {
    const offset = start + index;
    if (offset >= bytes.length) return null;
    const byte = bytes[offset]!;
    if (index === 4 && byte > 0x0f) return null;
    value += (byte & 0x7f) * 2 ** (7 * index);
    if ((byte & 0x80) === 0) return { value, next: offset + 1 };
  }
  return null;
}

const strictUtf8 = new TextDecoder("utf-8", { fatal: true });

/**
 * Walks the module's section headers without interpreting any code.
 *
 * Every length is checked against the bytes that remain before it is used,
 * so a declared length can never send the reader past the end of the upload.
 */
export function parseWasmSections(bytes: Uint8Array): Result<CustomSection[], DecodeFailure> {
  if (bytes.length > MAX_WASM_BYTES) return err("malformed_data");
  if (bytes.length < 8 || !hasWasmMagic(bytes)) return err("malformed_data");
  if (!WASM_VERSION_1.every((byte, index) => bytes[4 + index] === byte)) {
    return err("unsupported_variant");
  }

  const custom: CustomSection[] = [];
  const seenStandard = new Set<number>();
  let offset = 8;

  while (offset < bytes.length) {
    const sectionStart = offset;
    const id = bytes[offset++]!;
    if (id > MAX_STANDARD_SECTION_ID) return err("unsupported_variant");

    const size = readU32Leb(bytes, offset);
    if (!size) return err("malformed_data");
    const end = size.next + size.value;
    if (end > bytes.length) return err("malformed_data");

    if (id === 0) {
      const nameLength = readU32Leb(bytes, size.next);
      if (!nameLength) return err("malformed_data");
      const nameEnd = nameLength.next + nameLength.value;
      if (nameLength.next > end || nameEnd > end) return err("malformed_data");

      let name: string;
      try {
        name = strictUtf8.decode(bytes.subarray(nameLength.next, nameEnd));
      } catch {
        return err("malformed_data");
      }
      custom.push({ name, offset: sectionStart, payload: bytes.subarray(nameEnd, end) });
    } else {
      // A standard section may appear at most once in a valid module.
      if (seenStandard.has(id)) return err("malformed_data");
      seenStandard.add(id);
    }

    offset = end;
  }

  return ok(custom);
}

function text(value: string | Buffer): string {
  return typeof value === "string" ? value : strictUtf8.decode(value);
}

function asBuffer(bytes: Uint8Array): Buffer {
  return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

/** Decodes a custom section's payload as a back-to-back stream of XDR values. */
function readStream<T>(payload: Uint8Array, read: (reader: cereal.XdrReader) => T): T[] {
  const reader = new cereal.XdrReader(asBuffer(payload));
  const out: T[] = [];
  while (!reader.eof) out.push(read(reader));
  return out;
}

type SpecTypeRead = (io: unknown) => unknown;
const readSpecEntry = (reader: cereal.XdrReader) =>
  (xdr.ScSpecEntry.read as unknown as SpecTypeRead)(reader) as xdr.ScSpecEntry;
const readEnvEntry = (reader: cereal.XdrReader) =>
  (xdr.ScEnvMetaEntry.read as unknown as SpecTypeRead)(reader) as xdr.ScEnvMetaEntry;
const readMetaEntry = (reader: cereal.XdrReader) =>
  (xdr.ScMetaEntry.read as unknown as SpecTypeRead)(reader) as xdr.ScMetaEntry;

const PRIMITIVE_TYPES: Record<string, string> = {
  scSpecTypeVal: "Val",
  scSpecTypeBool: "bool",
  scSpecTypeVoid: "()",
  scSpecTypeError: "Error",
  scSpecTypeU32: "u32",
  scSpecTypeI32: "i32",
  scSpecTypeU64: "u64",
  scSpecTypeI64: "i64",
  scSpecTypeTimepoint: "Timepoint",
  scSpecTypeDuration: "Duration",
  scSpecTypeU128: "u128",
  scSpecTypeI128: "i128",
  scSpecTypeU256: "u256",
  scSpecTypeI256: "i256",
  scSpecTypeBytes: "Bytes",
  scSpecTypeString: "String",
  scSpecTypeSymbol: "Symbol",
  scSpecTypeAddress: "Address"
};

/**
 * Renders a spec type as one canonical, lossless line, e.g.
 * `Option<Map<Address, Vec<i128>>>` or `BytesN<32>`.
 */
export function renderSpecType(type: xdr.ScSpecTypeDef, depth = 0): string {
  if (depth > MAX_TYPE_DEPTH) throw new RangeError("type nesting exceeds the supported depth");
  const kind = type.switch().name;
  const primitive = PRIMITIVE_TYPES[kind];
  if (primitive) return primitive;

  const next = depth + 1;
  switch (kind) {
    case "scSpecTypeOption":
      return `Option<${renderSpecType(type.option().valueType(), next)}>`;
    case "scSpecTypeResult": {
      const result = type.result();
      return `Result<${renderSpecType(result.okType(), next)}, ${renderSpecType(result.errorType(), next)}>`;
    }
    case "scSpecTypeVec":
      return `Vec<${renderSpecType(type.vec().elementType(), next)}>`;
    case "scSpecTypeMap": {
      const map = type.map();
      return `Map<${renderSpecType(map.keyType(), next)}, ${renderSpecType(map.valueType(), next)}>`;
    }
    case "scSpecTypeTuple":
      return `(${type
        .tuple()
        .valueTypes()
        .map((value) => renderSpecType(value, next))
        .join(", ")})`;
    case "scSpecTypeBytesN":
      return `BytesN<${type.bytesN().n()}>`;
    case "scSpecTypeUdt":
      return text(type.udt().name());
    default:
      throw new UnsupportedVariantError(`spec type ${kind}`);
  }
}

function sortedParts(parts: DeclarationPart[]): DeclarationPart[] {
  return [...parts].sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));
}

function signatureOf(kind: string, name: string, parts: DeclarationPart[]): string {
  return `${kind} ${name} { ${parts.map((part) => `${part.label} = ${part.value}`).join("; ")} }`;
}

function libraryPart(lib: string | Buffer): DeclarationPart[] {
  const value = text(lib);
  return value ? [{ label: "library", value }] : [];
}

interface DecodedDeclaration {
  declaration: Declaration;
  /** Member labels that appear more than once inside this one declaration. */
  duplicateMembers: string[];
}

function duplicates(labels: string[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const label of labels) (seen.has(label) ? repeated : seen).add(label);
  return [...repeated];
}

/**
 * Turns one spec entry into a comparable declaration.
 *
 * Function arguments are positional on the wire, so they are labelled by
 * position. Struct fields, union cases, enum cases and error cases are encoded
 * by name, so they are labelled by name and compared order-insensitively.
 * Doc strings are deliberately excluded from the comparison.
 */
export function toDeclaration(entry: xdr.ScSpecEntry): DecodedDeclaration {
  const kind = entry.switch().name;

  switch (kind) {
    case "scSpecEntryFunctionV0": {
      const fn = entry.functionV0();
      const name = text(fn.name());
      const inputs = fn.inputs().map((input) => ({
        name: text(input.name()),
        type: renderSpecType(input.type())
      }));
      const outputs = fn.outputs().map((output) => renderSpecType(output));
      const returns = outputs.length ? outputs.join(", ") : "()";
      const parts: DeclarationPart[] = [
        ...inputs.map((input, index) => ({
          label: `argument ${index + 1}`,
          value: `${input.name}: ${input.type}`
        })),
        { label: "returns", value: returns }
      ];
      return {
        declaration: {
          kind: "function",
          name,
          signature: `fn ${name}(${inputs.map((input) => `${input.name}: ${input.type}`).join(", ")}) -> ${returns}`,
          parts
        },
        duplicateMembers: duplicates(inputs.map((input) => `argument ${input.name}`))
      };
    }
    case "scSpecEntryUdtStructV0": {
      const struct = entry.udtStructV0();
      const name = text(struct.name());
      const fields = struct.fields().map((field) => ({
        label: `field ${text(field.name())}`,
        value: renderSpecType(field.type())
      }));
      const parts = [...libraryPart(struct.lib()), ...fields];
      return {
        declaration: { kind: "type", name, signature: signatureOf("struct", name, sortedParts(parts)), parts },
        duplicateMembers: duplicates(fields.map((field) => field.label))
      };
    }
    case "scSpecEntryUdtUnionV0": {
      const union = entry.udtUnionV0();
      const name = text(union.name());
      const cases = union.cases().map((unionCase) => {
        if (unionCase.switch().name === "scSpecUdtUnionCaseTupleV0") {
          const tuple = unionCase.tupleCase();
          return {
            label: `case ${text(tuple.name())}`,
            value: `(${tuple
              .type()
              .map((type) => renderSpecType(type))
              .join(", ")})`
          };
        }
        return { label: `case ${text(unionCase.voidCase().name())}`, value: "()" };
      });
      const parts = [...libraryPart(union.lib()), ...cases];
      return {
        declaration: { kind: "type", name, signature: signatureOf("union", name, sortedParts(parts)), parts },
        duplicateMembers: duplicates(cases.map((unionCase) => unionCase.label))
      };
    }
    case "scSpecEntryUdtEnumV0": {
      const enumeration = entry.udtEnumV0();
      const name = text(enumeration.name());
      const cases = enumeration.cases().map((enumCase) => ({
        label: `case ${text(enumCase.name())}`,
        value: String(enumCase.value())
      }));
      const parts = [...libraryPart(enumeration.lib()), ...cases];
      return {
        declaration: { kind: "type", name, signature: signatureOf("enum", name, sortedParts(parts)), parts },
        duplicateMembers: duplicates(cases.map((enumCase) => enumCase.label))
      };
    }
    case "scSpecEntryUdtErrorEnumV0": {
      const errors = entry.udtErrorEnumV0();
      const name = text(errors.name());
      const cases = errors.cases().map((errorCase) => ({
        label: `case ${text(errorCase.name())}`,
        value: String(errorCase.value())
      }));
      const parts = [...libraryPart(errors.lib()), ...cases];
      return {
        declaration: { kind: "error", name, signature: signatureOf("error", name, sortedParts(parts)), parts },
        duplicateMembers: duplicates(cases.map((errorCase) => errorCase.label))
      };
    }
    default:
      throw new UnsupportedVariantError(`spec entry ${kind}`);
  }
}

/** Functions and user-defined types live in separate namespaces in a Soroban spec. */
function namespaceOf(declaration: Declaration): "function" | "udt" {
  return declaration.kind === "function" ? "function" : "udt";
}

export function declarationKey(declaration: Pick<Declaration, "kind" | "name">): string {
  return `${declaration.kind === "function" ? "function" : "udt"}:${declaration.name}`;
}

/**
 * Collapses byte-identical repeats (for example a whole spec section emitted
 * twice) and reports genuine collisions: one stable name, different shapes.
 */
export function resolveDeclarations(decoded: DecodedDeclaration[]): {
  declarations: Declaration[];
  collisions: NameCollision[];
} {
  const groups = new Map<string, DecodedDeclaration[]>();
  for (const item of decoded) {
    const key = declarationKey(item.declaration);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }

  const declarations: Declaration[] = [];
  const collisions: NameCollision[] = [];

  for (const group of groups.values()) {
    const first = group[0]!.declaration;
    const scope = namespaceOf(first);
    const distinct = new Set(group.map((item) => `${item.declaration.kind}|${item.declaration.signature}`));
    if (distinct.size > 1) collisions.push({ scope, name: first.name, count: group.length });
    for (const member of group[0]!.duplicateMembers) {
      collisions.push({ scope, name: first.name, count: 2, member });
    }
    declarations.push(first);
  }

  return { declarations, collisions };
}

function evidence(
  section: MetadataSection,
  payloads: Uint8Array[],
  status: SectionEvidence["status"],
  entryCount: number
): SectionEvidence {
  return {
    section,
    status,
    sectionCount: payloads.length,
    entryCount,
    byteLength: payloads.reduce((sum, payload) => sum + payload.length, 0)
  };
}

function decodeSpec(payloads: Uint8Array[]) {
  if (!payloads.length) {
    return { evidence: evidence("contractspecv0", payloads, "absent", 0), declarations: null, collisions: [] };
  }
  try {
    const entries = payloads.flatMap((payload) => readStream(payload, readSpecEntry));
    const resolved = resolveDeclarations(entries.map(toDeclaration));
    return {
      evidence: evidence("contractspecv0", payloads, "present", entries.length),
      declarations: resolved.declarations,
      collisions: resolved.collisions
    };
  } catch (error) {
    return {
      evidence: evidence("contractspecv0", payloads, classifyDecodeFailure(error), 0),
      declarations: null,
      collisions: []
    };
  }
}

function decodeEnvironment(payloads: Uint8Array[]) {
  if (!payloads.length) {
    return { evidence: evidence("contractenvmetav0", payloads, "absent", 0), environment: null };
  }
  try {
    const entries = payloads.flatMap((payload) => readStream(payload, readEnvEntry));
    const versions = entries.map((entry) => {
      if (entry.switch().name !== "scEnvMetaKindInterfaceVersion") {
        throw new UnsupportedVariantError(`environment entry ${entry.switch().name}`);
      }
      const version = entry.interfaceVersion();
      return { protocol: version.protocol(), preRelease: version.preRelease() };
    });

    // A present section that declares no version gives nothing to compare.
    if (!versions.length) {
      return { evidence: evidence("contractenvmetav0", payloads, "malformed_data", 0), environment: null };
    }

    const distinct = new Set(versions.map((version) => `${version.protocol}.${version.preRelease}`));
    if (distinct.size > 1) {
      return {
        evidence: evidence("contractenvmetav0", payloads, "conflicting", versions.length),
        environment: null
      };
    }

    return {
      evidence: evidence("contractenvmetav0", payloads, "present", versions.length),
      environment: versions[0] as EnvVersion
    };
  } catch (error) {
    return {
      evidence: evidence("contractenvmetav0", payloads, classifyDecodeFailure(error), 0),
      environment: null
    };
  }
}

function decodeMetadata(payloads: Uint8Array[]) {
  if (!payloads.length) {
    return { evidence: evidence("contractmetav0", payloads, "absent", 0), metadata: null, collisions: [] };
  }
  try {
    const entries = payloads.flatMap((payload) => readStream(payload, readMetaEntry));
    const decoded: MetadataEntry[] = entries.map((entry) => {
      if (entry.switch().name !== "scMetaV0") {
        throw new UnsupportedVariantError(`metadata entry ${entry.switch().name}`);
      }
      const value = entry.v0();
      return { key: text(value.key()), value: text(value.val()) };
    });

    const byKey = new Map<string, MetadataEntry[]>();
    for (const entry of decoded) {
      const group = byKey.get(entry.key);
      if (group) group.push(entry);
      else byKey.set(entry.key, [entry]);
    }

    const metadata: MetadataEntry[] = [];
    const collisions: NameCollision[] = [];
    for (const [key, group] of byKey) {
      if (new Set(group.map((entry) => entry.value)).size > 1) {
        collisions.push({ scope: "metadata", name: key, count: group.length });
      }
      metadata.push(group[0]!);
    }

    return {
      evidence: evidence("contractmetav0", payloads, "present", decoded.length),
      metadata,
      collisions
    };
  } catch (error) {
    return {
      evidence: evidence("contractmetav0", payloads, classifyDecodeFailure(error), 0),
      metadata: null,
      collisions: []
    };
  }
}

/** Lowercase hex SHA-256 of the full upload, which is what Soroban uses as the Wasm hash. */
export function computeCodeHash(bytes: Uint8Array): string {
  return hash(asBuffer(bytes)).toString("hex");
}

/**
 * Reads one uploaded Wasm file's declared interface and metadata.
 *
 * Only section headers and the three Soroban custom sections are read; no
 * code is compiled, instantiated or executed. A framing failure rejects the
 * file; a problem inside a custom section only marks that section's evidence.
 */
export function extractWasmInterface(upload: WasmUpload): Result<WasmInterface, DecodeFailure> {
  const parsed = parseWasmSections(upload.bytes);
  if (!parsed.ok) return parsed;

  const bySection = (name: MetadataSection) =>
    parsed.value.filter((section) => section.name === name).map((section) => section.payload);

  const spec = decodeSpec(bySection("contractspecv0"));
  const env = decodeEnvironment(bySection("contractenvmetav0"));
  const meta = decodeMetadata(bySection("contractmetav0"));

  const sections = Object.fromEntries(
    METADATA_SECTIONS.map((section) => [
      section,
      section === "contractspecv0" ? spec.evidence : section === "contractenvmetav0" ? env.evidence : meta.evidence
    ])
  ) as Record<MetadataSection, SectionEvidence>;

  return ok({
    side: upload.side,
    fileName: upload.fileName,
    byteLength: upload.bytes.length,
    codeHash: computeCodeHash(upload.bytes),
    sections,
    declarations: spec.declarations,
    collisions: [...spec.collisions, ...meta.collisions],
    environment: env.environment,
    metadata: meta.metadata
  });
}
