import { StrKey, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type {
  ScvalCodecErrorCode,
  ScvalCodecInput,
  ScvalCodecResult,
  ScvalJson,
  ScvalJsonTagged
} from "@/features/scval-codec/types";

const U64_MAX = 18446744073709551615n;
const I64_MAX = 9223372036854775807n;
const I64_MIN = -9223372036854775808n;
const U128_MAX = 340282366920938463463374607431768211455n;
const I128_MAX = 170141183460469231731687303715884105727n;
const I128_MIN = -170141183460469231731687303715884105728n;

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runScvalCodec(
  input: ScvalCodecInput,
  _network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<ScvalCodecResult, ScvalCodecErrorCode>> {
  if (input.mode === "decode") {
    return decodeScValBase64(input.value);
  }
  return encodeJsonToScVal(input.value);
}

function decodeScValBase64(
  base64: string
): Result<ScvalCodecResult, ScvalCodecErrorCode> {
  let scVal: xdr.ScVal;
  try {
    scVal = xdr.ScVal.fromXDR(base64, "base64");
  } catch {
    return err("invalid_base64");
  }

  try {
    const json = scValToJson(scVal);
    return ok({
      mode: "decode",
      input: base64,
      output: JSON.stringify(json, null, 2),
      json
    });
  } catch (error) {
    if (error instanceof UnsupportedTypeError) return err("unsupported_type");
    return err("invalid_scval");
  }
}

function encodeJsonToScVal(
  rawJson: string
): Result<ScvalCodecResult, ScvalCodecErrorCode> {
  let json: ScvalJson;
  try {
    json = JSON.parse(rawJson) as ScvalJson;
  } catch {
    return err("invalid_json");
  }

  try {
    const scVal = jsonToScVal(json);
    const base64 = scVal.toXDR("base64");
    return ok({
      mode: "encode",
      input: rawJson,
      output: base64,
      base64
    });
  } catch (error) {
    if (error instanceof UnsupportedTypeError) return err("unsupported_type");
    return err("invalid_json");
  }
}

class UnsupportedTypeError extends Error {}

export function scValToJson(scVal: xdr.ScVal): ScvalJson {
  const typeName = scVal.switch().name;

  switch (typeName) {
    case "scvVoid":
      return null;
    case "scvBool":
      return scVal.b();
    case "scvU32":
      return scVal.u32();
    case "scvI32":
      return scVal.i32();
    case "scvU64":
      return tag("u64", scVal.u64().toString());
    case "scvI64":
      return tag("i64", scVal.i64().toString());
    case "scvTimepoint":
      return tag("timepoint", scVal.timepoint().toString());
    case "scvDuration":
      return tag("duration", scVal.duration().toString());
    case "scvU128":
      return tag("u128", u128ToString(scVal.u128()));
    case "scvI128":
      return tag("i128", i128ToString(scVal.i128()));
    case "scvU256":
      return tag("u256", u256ToString(scVal.u256()));
    case "scvI256":
      return tag("i256", i256ToString(scVal.i256()));
    case "scvBytes":
      return tag("bytes", Buffer.from(scVal.bytes()).toString("base64"));
    case "scvString":
      return scVal.str().toString();
    case "scvSymbol":
      return tag("symbol", scVal.sym().toString());
    case "scvVec":
      return (scVal.vec() ?? []).map(scValToJson);
    case "scvMap":
      return tag(
        "map",
        (scVal.map() ?? []).map((entry) => [
          scValToJson(entry.key()),
          scValToJson(entry.val())
        ])
      );
    case "scvAddress":
      return tag("address", encodeScAddress(scVal.address()));
    case "scvError":
      return tag("error", scErrorToJson(scVal.error()));
    default:
      throw new UnsupportedTypeError(`Unsupported ScVal type: ${typeName}`);
  }
}

function tag<T extends ScvalJsonTagged["_type"]>(
  _type: T,
  value: unknown
): ScvalJsonTagged {
  return { _type, value } as ScvalJsonTagged;
}

function encodeScAddress(address: xdr.ScAddress): string {
  const typeName = address.switch().name;
  if (typeName === "scAddressTypeAccount") {
    return StrKey.encodeEd25519PublicKey(address.accountId().ed25519());
  }
  if (typeName === "scAddressTypeContract") {
    return StrKey.encodeContract(address.contractId());
  }
  throw new UnsupportedTypeError(`Unsupported address type: ${typeName}`);
}

function scErrorToJson(error: xdr.ScError): ScvalJsonTagged {
  const typeName = error.switch().name;
  if (typeName === "sceContract") {
    return tag("error", { contract: error.contractCode() });
  }
  return tag("error", { type: typeName, code: error.code() });
}

function u128ToString(parts: xdr.UInt128Parts): string {
  const hi = BigInt(parts.hi().toString());
  const lo = BigInt(parts.lo().toString());
  return (hi << 64n | lo).toString();
}

function i128ToString(parts: xdr.Int128Parts): string {
  const hi = BigInt(parts.hi().toString());
  const lo = BigInt(parts.lo().toString());
  const unsigned = hi << 64n | lo;
  if (hi >> 63n) {
    return (unsigned - (1n << 128n)).toString();
  }
  return unsigned.toString();
}

function u256ToString(parts: xdr.UInt256Parts): string {
  const hiHi = BigInt(parts.hiHi().toString());
  const hiLo = BigInt(parts.hiLo().toString());
  const loHi = BigInt(parts.loHi().toString());
  const loLo = BigInt(parts.loLo().toString());
  return (
    (hiHi << 192n) |
    (hiLo << 128n) |
    (loHi << 64n) |
    loLo
  ).toString();
}

function i256ToString(parts: xdr.Int256Parts): string {
  const hiHi = BigInt(parts.hiHi().toString());
  const hiLo = BigInt(parts.hiLo().toString());
  const loHi = BigInt(parts.loHi().toString());
  const loLo = BigInt(parts.loLo().toString());
  const unsigned =
    (hiHi << 192n) |
    (hiLo << 128n) |
    (loHi << 64n) |
    loLo;
  if (hiHi >> 63n) {
    return (unsigned - (1n << 256n)).toString();
  }
  return unsigned.toString();
}

export function jsonToScVal(json: ScvalJson): xdr.ScVal {
  if (json === null) return xdr.ScVal.scvVoid();
  if (typeof json === "boolean") return xdr.ScVal.scvBool(json);
  if (typeof json === "number") return numberToScVal(json);
  if (typeof json === "string") return xdr.ScVal.scvString(json);
  if (Array.isArray(json)) return xdr.ScVal.scvVec(json.map(jsonToScVal));
  if (typeof json === "object") return taggedToScVal(json as ScvalJsonTagged);
  throw new UnsupportedTypeError(`Unsupported JSON value: ${json}`);
}

function numberToScVal(num: number): xdr.ScVal {
  if (!Number.isInteger(num)) {
    throw new UnsupportedTypeError("Non-integer numbers are not supported as ScVal");
  }
  if (num >= 0 && num <= 0xffffffff) return xdr.ScVal.scvU32(num);
  if (num >= -0x80000000 && num < 0) return xdr.ScVal.scvI32(num);
  throw new UnsupportedTypeError(`Number ${num} is outside i32/u32 range; use a tagged type`);
}

function taggedToScVal(tagged: ScvalJsonTagged): xdr.ScVal {
  const { _type, value } = tagged;

  switch (_type) {
    case "u32":
      return xdr.ScVal.scvU32(parseNumber(value));
    case "i32":
      return xdr.ScVal.scvI32(parseNumber(value));
    case "u64":
      return xdr.ScVal.scvU64(xdr.Uint64.fromString(parseBigInt(value, U64_MAX, 0n).toString()));
    case "i64":
      return xdr.ScVal.scvI64(xdr.Int64.fromString(parseBigInt(value, I64_MAX, I64_MIN).toString()));
    case "timepoint":
      return xdr.ScVal.scvTimepoint(xdr.Uint64.fromString(parseBigInt(value, U64_MAX, 0n).toString()));
    case "duration":
      return xdr.ScVal.scvDuration(xdr.Uint64.fromString(parseBigInt(value, U64_MAX, 0n).toString()));
    case "u128":
      return xdr.ScVal.scvU128(stringToU128(parseBigInt(value, U128_MAX, 0n).toString()));
    case "i128":
      return xdr.ScVal.scvI128(stringToI128(parseBigInt(value, I128_MAX, I128_MIN).toString()));
    case "u256":
      return xdr.ScVal.scvU256(stringToU256(parseBigInt256(value, false).toString()));
    case "i256":
      return xdr.ScVal.scvI256(stringToI256(parseBigInt256(value, true).toString()));
    case "bytes":
      return xdr.ScVal.scvBytes(Buffer.from(String(value), "base64"));
    case "symbol":
      return xdr.ScVal.scvSymbol(String(value));
    case "address":
      return addressToScVal(String(value));
    case "error":
      return errorToScVal(value);
    case "vec":
      return xdr.ScVal.scvVec((value as ScvalJson[]).map(jsonToScVal));
    case "map":
      return xdr.ScVal.scvMap(
        (value as [ScvalJson, ScvalJson][]).map(([k, v]) =>
          new xdr.ScMapEntry({ key: jsonToScVal(k), val: jsonToScVal(v) })
        )
      );
    default:
      throw new UnsupportedTypeError(`Unsupported tagged type: ${_type}`);
  }
}

function parseNumber(value: unknown): number {
  if (typeof value === "number") return value;
  const n = Number(value);
  if (!Number.isInteger(n)) throw new UnsupportedTypeError(`Expected integer, got ${value}`);
  return n;
}

function parseBigInt(value: unknown, max: bigint, min: bigint): bigint {
  const s = String(value).trim();
  let n: bigint;
  try {
    n = BigInt(s);
  } catch {
    throw new UnsupportedTypeError(`Invalid integer: ${s}`);
  }
  if (n > max || n < min) {
    throw new UnsupportedTypeError(`Value ${s} out of range [${min}, ${max}]`);
  }
  return n;
}

function parseBigInt256(value: unknown, signed: boolean): bigint {
  const s = String(value).trim();
  let n: bigint;
  try {
    n = BigInt(s);
  } catch {
    throw new UnsupportedTypeError(`Invalid integer: ${s}`);
  }
  const max = signed ? (1n << 255n) - 1n : (1n << 256n) - 1n;
  const min = signed ? -(1n << 255n) : 0n;
  if (n > max || n < min) {
    throw new UnsupportedTypeError(`Value ${s} out of 256-bit range`);
  }
  return n;
}

function stringToU128(s: string): xdr.UInt128Parts {
  const n = BigInt(s);
  return new xdr.UInt128Parts({
    hi: xdr.Uint64.fromString((n >> 64n).toString()),
    lo: xdr.Uint64.fromString((n & 0xffffffffffffffffn).toString())
  });
}

function stringToI128(s: string): xdr.Int128Parts {
  let n = BigInt(s);
  if (n < 0n) n += 1n << 128n;
  return new xdr.Int128Parts({
    hi: xdr.Int64.fromString((n >> 64n).toString()),
    lo: xdr.Uint64.fromString((n & 0xffffffffffffffffn).toString())
  });
}

function stringToU256(s: string): xdr.UInt256Parts {
  const n = BigInt(s);
  return new xdr.UInt256Parts({
    hiHi: xdr.Uint64.fromString((n >> 192n).toString()),
    hiLo: xdr.Uint64.fromString(((n >> 128n) & 0xffffffffffffffffn).toString()),
    loHi: xdr.Uint64.fromString(((n >> 64n) & 0xffffffffffffffffn).toString()),
    loLo: xdr.Uint64.fromString((n & 0xffffffffffffffffn).toString())
  });
}

function stringToI256(s: string): xdr.Int256Parts {
  let n = BigInt(s);
  if (n < 0n) n += 1n << 256n;
  return new xdr.Int256Parts({
    hiHi: xdr.Int64.fromString((n >> 192n).toString()),
    hiLo: xdr.Uint64.fromString(((n >> 128n) & 0xffffffffffffffffn).toString()),
    loHi: xdr.Uint64.fromString(((n >> 64n) & 0xffffffffffffffffn).toString()),
    loLo: xdr.Uint64.fromString((n & 0xffffffffffffffffn).toString())
  });
}

function addressToScVal(address: string): xdr.ScVal {
  if (StrKey.isValidEd25519PublicKey(address)) {
    return xdr.ScVal.scvAddress(
      xdr.ScAddress.scAddressTypeAccount(
        xdr.PublicKey.publicKeyTypeEd25519(StrKey.decodeEd25519PublicKey(address))
      )
    );
  }
  if (StrKey.isValidContract(address)) {
    return xdr.ScVal.scvAddress(
      xdr.ScAddress.scAddressTypeContract(StrKey.decodeContract(address))
    );
  }
  throw new UnsupportedTypeError(`Invalid Stellar address: ${address}`);
}

function errorToScVal(value: unknown): xdr.ScVal {
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.contract === "number") {
      return xdr.ScVal.scvError(xdr.ScError.sceContract(obj.contract));
    }
    if (typeof obj.type === "string" && typeof obj.code === "number") {
      const factory = (xdr.ScError as unknown as Record<string, (code: number) => xdr.ScError>)[obj.type];
      if (factory) return xdr.ScVal.scvError(factory(obj.code));
    }
  }
  throw new UnsupportedTypeError(`Unsupported error representation: ${JSON.stringify(value)}`);
}
