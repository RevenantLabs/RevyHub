import { hash, Keypair } from "@stellar/stellar-sdk";
import { toBase64, toHex } from "@/features/memo-inspector/lib/bytes";
import type { RawMemoForm } from "@/features/memo-inspector/schema";

/** A 32-byte value derived from a fixed label, never hand-typed. */
const digest = (label: string) => new Uint8Array(hash(Buffer.from(label)));

/** This label is chosen so the base64 form contains `+`, exercising URL-safe input. */
export const hashBytes = digest("memo-hash-fixture");
export const hashHex = toHex(hashBytes);
export const hashBase64 = toBase64(hashBytes);

/** URL-safe base64 of the same 32 bytes, which the parser also accepts. */
export const hashBase64Url = hashBase64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export const noneForm: RawMemoForm = { kind: "none", value: "" };
export const textForm: RawMemoForm = { kind: "text", value: "Invoice 1001" };
export const idForm: RawMemoForm = { kind: "id", value: "1234567890" };
export const hashForm: RawMemoForm = { kind: "hash", value: hashHex };
export const returnForm: RawMemoForm = { kind: "return", value: hashBase64 };

/** 28 ASCII bytes exactly — the largest a text memo can hold. */
export const textAtByteLimit = "a".repeat(28);
/** 10 rocket emoji: 10 characters, but 40 bytes. The case this tool exists for. */
export const textOverByteLimit = "🚀".repeat(10);
/** 7 rocket emoji: 28 bytes exactly, so it fits despite looking short. */
export const textEmojiAtByteLimit = "🚀".repeat(7);
/** A memo whose bytes are already a multiple of four, so XDR adds no padding. */
export const textWithoutPadding = "abcd";

/** 2^64 - 1, the largest unsigned 64-bit integer. */
export const maxMemoId = "18446744073709551615";
/** 2^64, one past the top of the range. */
export const overMaxMemoId = "18446744073709551616";

/** 31 bytes of hex — a truncated paste, the most common hash mistake. */
export const shortHashHex = hashHex.slice(0, 62);

/**
 * A secret key derived from a fixed seed, used only to prove this tool refuses
 * one. It is never rendered by any component.
 */
export const secretKey = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 3)).secret();
