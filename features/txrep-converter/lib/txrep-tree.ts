import {
  Asset,
  StrKey,
  decodeAddressToMuxedAccount,
  encodeMuxedAccountToAddress,
  xdr
} from "@stellar/stellar-sdk";

const VERSIONED_ENVELOPE = /^TransactionV\d+Envelope$/;
const MAX_ASSET_CODE = 12;

type XdrType = {
  name?: string;
  structName?: string;
  unionName?: string;
  enumName?: string;
  _fields?: Array<[string, XdrType]>;
  _childType?: XdrType;
  _maxLength?: number;
  _length?: number;
  _switchOn?: XdrType & { fromName: (name: string) => EnumValue; values: () => EnumValue[] };
  armForSwitch?: (value: unknown) => string | { name?: string };
  armTypeForArm?: (arm: unknown) => XdrType;
  fromName?: (name: string) => EnumValue;
  values?: () => EnumValue[];
  fromString?: (value: string) => unknown;
  readString?: unknown;
  constructor?: { name?: string };
};

interface EnumValue {
  name: string;
  value: number;
}

interface UnionValue {
  arm: () => string | { name?: string };
  armType: () => XdrType;
  switch: () => EnumValue | number;
  value: () => unknown;
  ed25519?: () => Buffer;
}

export class TxrepReadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TxrepReadError";
  }
}

export function xdrToTxrep(raw: string): string {
  const envelope = xdr.TransactionEnvelope.fromXDR(raw.trim(), "base64");
  assertSupported(envelope as unknown as { arm: () => unknown });
  return emit(xdr.TransactionEnvelope as unknown as XdrType, envelope, "").join("\n");
}

export function txrepToXdr(raw: string): string {
  const fields = parseLines(raw);
  if (!fields.has("type")) throw new TxrepReadError("missing type");
  const envelope = readValue(xdr.TransactionEnvelope as unknown as XdrType, "", fields) as UnionValue;
  assertSupported(envelope);
  return (envelope as unknown as { toXDR: (format: string) => string }).toXDR("base64");
}

export function sameEnvelopeBytes(left: string, right: string): boolean {
  return Buffer.from(left, "base64").equals(Buffer.from(right, "base64"));
}

function assertSupported(envelope: { arm: () => unknown }): void {
  const arm = envelope.arm();
  if (arm !== "v0" && arm !== "v1" && arm !== "feeBump") {
    throw new UnsupportedEnvelopeError(String(arm));
  }
}

export class UnsupportedEnvelopeError extends Error {
  constructor(arm: string) {
    super(arm);
    this.name = "UnsupportedEnvelopeError";
  }
}

function emit(type: XdrType, value: unknown, path: string): string[] {
  if (type.unionName && isStrKeyUnion(type.unionName)) {
    return [`${path}: ${formatStrKeyUnion(type.unionName, value as UnionValue)}`];
  }
  if (type.unionName === "Asset" || type.unionName === "TrustLineAsset") {
    return [`${path}: ${formatAsset(value as UnionValue)}`];
  }
  if (type.unionName === "AssetCode" || type.unionName === "AllowTrustOpAsset") {
    return [`${path}: ${formatAssetCodeUnion(value as UnionValue)}`];
  }

  const kind = kindOf(type);
  if (kind === "option") {
    const present = value !== null && value !== undefined;
    const lines = [`${path}._present: ${present}`];
    if (present) lines.push(...emit(type._childType as XdrType, value, path));
    return lines;
  }
  if (kind === "varArray") {
    const items = value as unknown[];
    const lines = [`${path}.len: ${items.length}`];
    items.forEach((item, index) => {
      lines.push(...emit(type._childType as XdrType, item, `${path}[${index}]`));
    });
    return lines;
  }
  if (kind === "array") {
    const items = value as unknown[];
    return items.flatMap((item, index) => emit(type._childType as XdrType, item, `${path}[${index}]`));
  }
  if (kind === "struct") {
    return (type._fields ?? []).flatMap(([field, fieldType]) =>
      emit(fieldType, (value as Record<string, () => unknown>)[field](), join(path, field))
    );
  }
  if (kind === "union") {
    const union = value as UnionValue;
    const lines = [`${join(path, discriminantName(type))}: ${formatSwitch(union.switch())}`];
    const armType = union.armType();
    if (kindOf(armType) === "Void") return lines;
    const inline = Boolean(armType.structName && VERSIONED_ENVELOPE.test(armType.structName));
    const arm = union.arm();
    const next = inline ? path : join(path, typeof arm === "string" ? arm : "");
    lines.push(...emit(armType, union.value(), next));
    return lines;
  }
  return [`${path}: ${formatPrimitive(type, value)}`];
}

function readValue(type: XdrType, path: string, fields: Map<string, string>): unknown {
  if (type.unionName && isStrKeyUnion(type.unionName)) {
    return parseStrKeyUnion(type.unionName, required(fields, path));
  }
  if (type.unionName === "Asset" || type.unionName === "TrustLineAsset") {
    return parseAsset(required(fields, path), type.unionName);
  }
  if (type.unionName === "AssetCode" || type.unionName === "AllowTrustOpAsset") {
    return parseAssetCodeUnion(required(fields, path));
  }

  const kind = kindOf(type);
  if (kind === "option") {
    const flag = fields.get(`${path}._present`);
    const present = flag === undefined ? hasChild(fields, path) : parseBool(flag);
    if (!present) return null;
    return readValue(type._childType as XdrType, path, fields);
  }
  if (kind === "varArray") {
    const raw = fields.get(`${path}.len`);
    const length = raw === undefined ? 0 : parseUint(raw, type._maxLength);
    return Array.from({ length }, (_, index) =>
      readValue(type._childType as XdrType, `${path}[${index}]`, fields)
    );
  }
  if (kind === "array") {
    const length = type._length ?? 0;
    return Array.from({ length }, (_, index) =>
      readValue(type._childType as XdrType, `${path}[${index}]`, fields)
    );
  }
  if (kind === "struct") {
    const attributes: Record<string, unknown> = {};
    for (const [field, fieldType] of type._fields ?? []) {
      attributes[field] = readValue(fieldType, join(path, field), fields);
    }
    const StructType = type as unknown as new (attributes: Record<string, unknown>) => unknown;
    return new StructType(attributes);
  }
  if (kind === "union") {
    const raw = fields.get(join(path, discriminantName(type)));
    const discriminant = parseSwitch(type._switchOn as XdrType, raw);
    const UnionType = type as unknown as {
      armForSwitch: (value: unknown) => string | { name?: string };
      armTypeForArm: (arm: unknown) => XdrType;
      new (disc: unknown, armValue: unknown): unknown;
    };
    let arm: string | { name?: string };
    try {
      arm = UnionType.armForSwitch(discriminant);
    } catch {
      throw new TxrepReadError(`unsupported arm at ${path || "type"}`);
    }
    const armType = UnionType.armTypeForArm(arm);
    const armValue =
      kindOf(armType) === "Void"
        ? undefined
        : readValue(
            armType,
            Boolean(armType.structName && VERSIONED_ENVELOPE.test(armType.structName))
              ? path
              : join(path, typeof arm === "string" ? arm : ""),
            fields
          );
    return new (type as unknown as new (disc: unknown, armValue: unknown) => unknown)(discriminant, armValue);
  }
  return parsePrimitive(type, fields.get(path));
}

function parseLines(raw: string): Map<string, string> {
  const fields = new Map<string, string>();
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(":")) continue;
    const colon = trimmed.indexOf(":");
    if (colon <= 0) throw new TxrepReadError("missing field");
    const key = trimmed.slice(0, colon).trim();
    if (!/^[A-Za-z_][\w.\[\]]*$/.test(key)) throw new TxrepReadError(`bad field ${key}`);
    fields.set(key, valueToken(trimmed.slice(colon + 1).trim()));
  }
  return fields;
}

function valueToken(rest: string): string {
  if (rest.startsWith('"')) return rest;
  const token = rest.split(/\s+/)[0];
  if (!token) throw new TxrepReadError("missing value");
  return token;
}

function required(fields: Map<string, string>, path: string): string {
  const value = fields.get(path);
  if (value === undefined) throw new TxrepReadError(`missing ${path}`);
  return value;
}

function hasChild(fields: Map<string, string>, path: string): boolean {
  const prefix = `${path}.`;
  const index = `${path}[`;
  for (const key of fields.keys()) {
    if (key.startsWith(prefix) || key.startsWith(index)) return true;
  }
  return false;
}

function kindOf(type: XdrType): string {
  if (type.unionName) return "union";
  if (type.structName) return "struct";
  if (type.enumName) return "enum";
  if (type.name === "UnsignedInt" || type.name === "Int" || type.name === "Hyper" || type.name === "UnsignedHyper" || type.name === "Bool" || type.name === "Void") {
    return type.name;
  }
  const proto = type.constructor?.name;
  if (proto === "VarArray" || proto === "Array" || proto === "Option" || proto === "Opaque" || proto === "VarOpaque" || proto === "String") {
    return proto === "VarArray" ? "varArray" : proto === "Array" ? "array" : proto === "Option" ? "option" : proto === "Opaque" ? "opaque" : proto === "VarOpaque" ? "varOpaque" : "string";
  }
  if (typeof type.readString === "function") return "string";
  return "unknown";
}

function discriminantName(type: XdrType): string {
  return type._switchOn?.enumName ? "type" : "v";
}

function formatSwitch(value: EnumValue | number): string {
  if (typeof value === "number") return String(value);
  return camelToScreaming(value.name);
}

function parseSwitch(type: XdrType, raw: string | undefined): unknown {
  if (type.enumName && type.fromName && type.values) {
    const text = raw ?? camelToScreaming(type.values().find((entry) => entry.value === 0)?.name ?? "");
    if (text.includes("#")) {
      const number = Number(text.slice(text.indexOf("#") + 1));
      const found = type.values().find((entry) => entry.value === number);
      if (!Number.isInteger(number) || !found) throw new TxrepReadError(`bad enum ${text}`);
      return found;
    }
    try {
      return type.fromName(screamingToCamel(text));
    } catch {
      throw new TxrepReadError(`bad enum ${text}`);
    }
  }
  return raw === undefined ? 0 : parseIntStrict(raw);
}

function formatPrimitive(type: XdrType, value: unknown): string {
  const kind = kindOf(type);
  if (kind === "Bool") return value ? "true" : "false";
  if (kind === "UnsignedInt" || kind === "Int" || kind === "Hyper" || kind === "UnsignedHyper") {
    return String(value);
  }
  if (kind === "string") return quote(Buffer.from(value as Uint8Array));
  if (kind === "opaque") return Buffer.from(value as Uint8Array).toString("hex");
  if (kind === "varOpaque") {
    const bytes = Buffer.from(value as Uint8Array);
    return bytes.length === 0 ? "0" : bytes.toString("hex");
  }
  throw new TxrepReadError(`unsupported value at primitive`);
}

function parsePrimitive(type: XdrType, raw: string | undefined): unknown {
  const kind = kindOf(type);
  if (kind === "Bool") return raw === undefined ? false : parseBool(raw);
  if (kind === "UnsignedInt" || kind === "Int") {
    return raw === undefined ? 0 : parseIntStrict(raw);
  }
  if (kind === "Hyper" || kind === "UnsignedHyper") {
    const text = raw ?? "0";
    if (!/^-?(0x[0-9a-fA-F]+|[0-9]+)$/.test(text)) throw new TxrepReadError(`bad integer ${text}`);
    const decimal = text.startsWith("0x") || text.startsWith("-0x") ? BigInt(text).toString() : text;
    return type.fromString?.(decimal);
  }
  if (kind === "string") return raw === undefined ? Buffer.alloc(0) : parseQuoted(raw);
  if (kind === "opaque") return parseFixedHex(raw ?? "", type._length ?? 0);
  if (kind === "varOpaque") {
    if (raw === undefined || raw === "0") return Buffer.alloc(0);
    return parseHex(raw);
  }
  throw new TxrepReadError("unsupported primitive");
}

function parseBool(raw: string): boolean {
  if (raw === "true") return true;
  if (raw === "false") return false;
  throw new TxrepReadError(`bad bool ${raw}`);
}

function parseUint(raw: string, max?: number): number {
  const value = parseIntStrict(raw);
  if (value < 0 || (max !== undefined && value > max)) throw new TxrepReadError(`bad length ${raw}`);
  return value;
}

function parseIntStrict(raw: string): number {
  if (!/^-?(0x[0-9a-fA-F]+|[0-9]+)$/.test(raw)) throw new TxrepReadError(`bad integer ${raw}`);
  const value = raw.startsWith("0x") || raw.startsWith("-0x") ? Number(BigInt(raw)) : Number(raw);
  if (!Number.isSafeInteger(value)) throw new TxrepReadError(`bad integer ${raw}`);
  return value;
}

function parseFixedHex(raw: string, length: number): Buffer {
  const bytes = raw === "" ? Buffer.alloc(0) : parseHex(raw);
  if (bytes.length !== length) throw new TxrepReadError("opaque length");
  return bytes;
}

function parseHex(raw: string): Buffer {
  if (!/^[0-9a-f]*$/i.test(raw) || raw.length % 2 !== 0) throw new TxrepReadError("bad opaque");
  return Buffer.from(raw, "hex");
}

function quote(bytes: Buffer): string {
  let out = '"';
  for (const byte of bytes) {
    if (byte === 0x22 || byte === 0x5c) out += `\\${String.fromCharCode(byte)}`;
    else if (byte === 0x0a) out += "\\n";
    else if (byte < 0x20 || byte > 0x7e) out += `\\x${byte.toString(16).padStart(2, "0")}`;
    else out += String.fromCharCode(byte);
  }
  return `${out}"`;
}

function parseQuoted(raw: string): Buffer {
  if (!raw.startsWith('"')) throw new TxrepReadError("bad string");
  const bytes: number[] = [];
  for (let index = 1; index < raw.length; index += 1) {
    const char = raw[index];
    if (char === '"') return Buffer.from(bytes);
    if (char !== "\\") {
      bytes.push(char.charCodeAt(0));
      continue;
    }
    const next = raw[index + 1];
    if (next === "n") {
      bytes.push(0x0a);
      index += 1;
      continue;
    }
    if (next === "x") {
      const hex = raw.slice(index + 2, index + 4);
      if (!/^[0-9a-fA-F]{2}$/.test(hex)) throw new TxrepReadError("bad string");
      bytes.push(Number.parseInt(hex, 16));
      index += 3;
      continue;
    }
    if (!next) throw new TxrepReadError("bad string");
    bytes.push(next.charCodeAt(0));
    index += 1;
  }
  throw new TxrepReadError("bad string");
}

function isStrKeyUnion(name: string): boolean {
  return name === "PublicKey" || name === "MuxedAccount" || name === "SignerKey";
}

function formatStrKeyUnion(name: string, value: UnionValue): string {
  if (name === "MuxedAccount") return encodeMuxedAccountToAddress(value as never, true);
  if (name === "PublicKey") return StrKey.encodeEd25519PublicKey(value.ed25519?.() ?? Buffer.alloc(0));
  return formatSignerKey(value);
}

function parseStrKeyUnion(name: string, raw: string): unknown {
  if (StrKey.isValidEd25519SecretSeed(raw)) throw new TxrepReadError("secret seed");
  if (name === "MuxedAccount") return decodeAddressToMuxedAccount(raw, true);
  if (name === "PublicKey") {
    return xdr.PublicKey.publicKeyTypeEd25519(StrKey.decodeEd25519PublicKey(raw));
  }
  return parseSignerKey(raw);
}

function formatSignerKey(value: UnionValue): string {
  const arm = value.arm();
  const raw = value.value() as Buffer;
  if (arm === "ed25519") return StrKey.encodeEd25519PublicKey(raw);
  if (arm === "preAuthTx") return StrKey.encodePreAuthTx(raw);
  if (arm === "hashX") return StrKey.encodeSha256Hash(raw);
  if (arm === "ed25519SignedPayload") {
    return StrKey.encodeSignedPayload(Buffer.from((raw as unknown as { toXDR: () => Buffer }).toXDR()));
  }
  throw new TxrepReadError("unsupported signer");
}

function decodeStrKey(decode: (value: string) => Buffer, raw: string): Buffer | null {
  try {
    return decode(raw);
  } catch {
    return null;
  }
}

function parseSignerKey(raw: string): unknown {
  if (StrKey.isValidEd25519PublicKey(raw)) {
    return xdr.SignerKey.signerKeyTypeEd25519(StrKey.decodeEd25519PublicKey(raw));
  }
  const preAuth = decodeStrKey(StrKey.decodePreAuthTx, raw);
  if (preAuth) return xdr.SignerKey.signerKeyTypePreAuthTx(preAuth);
  const hashX = decodeStrKey(StrKey.decodeSha256Hash, raw);
  if (hashX) return xdr.SignerKey.signerKeyTypeHashX(hashX);
  if (StrKey.isValidSignedPayload(raw)) {
    return xdr.SignerKey.signerKeyTypeEd25519SignedPayload(
      xdr.SignerKeyEd25519SignedPayload.fromXDR(StrKey.decodeSignedPayload(raw)) as never
    );
  }
  throw new TxrepReadError("bad signer");
}

function formatAsset(value: UnionValue): string {
  const switchName = (value.switch() as EnumValue).name;
  if (switchName === "assetTypeNative") return "native";
  const arm = value.arm();
  if (arm === "alphaNum4" || arm === "alphaNum12") {
    const body = value.value() as { assetCode: () => Buffer; issuer: () => UnionValue };
    return `${formatCode(body.assetCode(), arm === "alphaNum4" ? 4 : 12)}:${formatStrKeyUnion("PublicKey", body.issuer())}`;
  }
  const pool = Buffer.from(value.value() as Uint8Array).toString("hex");
  return `${pool}:lp`;
}

function parseAsset(raw: string, unionName: string): unknown {
  if (raw === "native" || raw === "XLM" || raw === "TestXLM") {
    const native = xdr.Asset.assetTypeNative();
    return unionName === "TrustLineAsset" ? xdr.TrustLineAsset.assetTypeNative() : native;
  }
  if (raw.endsWith(":lp")) {
    if (unionName !== "TrustLineAsset") throw new TxrepReadError("bad asset");
    return xdr.TrustLineAsset.assetTypePoolShare(parseHex(raw.slice(0, -3)) as unknown as xdr.PoolId);
  }
  const split = splitCode(raw);
  const asset = new Asset(unescapeCode(split.code).toString("utf8").replace(/\0+$/g, ""), split.issuer);
  const encoded = asset.toXDRObject();
  if (unionName === "TrustLineAsset") {
    return xdr.TrustLineAsset.fromXDR(encoded.toXDR());
  }
  return encoded;
}

function formatAssetCodeUnion(value: UnionValue): string {
  const arm = value.arm();
  return formatCode(value.value() as Buffer, arm === "assetCode4" || arm === "alphaNum4" ? 4 : 12);
}

function parseAssetCodeUnion(raw: string): unknown {
  const bytes = unescapeCode(raw);
  if (bytes.length <= 4) {
    const padded = Buffer.alloc(4);
    bytes.copy(padded);
    return xdr.AssetCode.assetTypeCreditAlphanum4(padded);
  }
  const padded = Buffer.alloc(12);
  bytes.copy(padded);
  return xdr.AssetCode.assetTypeCreditAlphanum12(padded);
}

function formatCode(bytes: Buffer, width: number): string {
  let end = bytes.length;
  while (end > 0 && bytes[end - 1] === 0) end -= 1;
  let significant = bytes.subarray(0, end);
  if (width === 12 && significant.length > 0 && significant.length < 5) {
    const padded = Buffer.alloc(5);
    significant.copy(padded);
    significant = padded;
  }
  return escapeCode(significant);
}

function escapeCode(bytes: Uint8Array): string {
  let out = "";
  for (const byte of bytes) {
    if (byte === 0x5c || byte === 0x3a || byte < 0x21 || byte > 0x7e) {
      out += byte === 0x5c || byte === 0x3a ? `\\${String.fromCharCode(byte)}` : `\\x${byte.toString(16).padStart(2, "0")}`;
    } else out += String.fromCharCode(byte);
  }
  return out;
}

function splitCode(raw: string): { code: string; issuer: string } {
  let escaped = false;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === ":") return { code: raw.slice(0, index), issuer: raw.slice(index + 1) };
  }
  throw new TxrepReadError("bad asset");
}

function unescapeCode(raw: string): Buffer {
  const bytes: number[] = [];
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char !== "\\") {
      bytes.push(char.charCodeAt(0));
      continue;
    }
    const next = raw[index + 1];
    if (next === "x") {
      bytes.push(Number.parseInt(raw.slice(index + 2, index + 4), 16));
      index += 3;
      continue;
    }
    bytes.push(next.charCodeAt(0));
    index += 1;
  }
  if (bytes.length > MAX_ASSET_CODE) throw new TxrepReadError("bad asset code");
  return Buffer.from(bytes);
}

function join(path: string, field: string): string {
  return path ? `${path}.${field}` : field;
}

function camelToScreaming(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toUpperCase();
}

function screamingToCamel(name: string): string {
  return name.toLowerCase().replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}
