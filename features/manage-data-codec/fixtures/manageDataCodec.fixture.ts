import { Keypair } from "@stellar/stellar-sdk";

/**
 * Values are derived rather than hand-typed so every fixture is exact: byte
 * lengths are computed, not counted by eye, and the boundary cases sit
 * precisely on the limit rather than near it.
 */
const encoder = new TextEncoder();

export const byteLengthOf = (text: string) => encoder.encode(text).length;

/** An ordinary ASCII name, well inside the limit. */
export const simpleName = "config.version";

/** An ordinary UTF-8 value. */
export const simpleValue = "1.4.0";

/** 64 ASCII characters — exactly 64 bytes, the largest legal name. */
export const asciiNameAtLimit = "a".repeat(64);

/** 65 ASCII characters — one byte over. */
export const asciiNameOverLimit = "a".repeat(65);

/**
 * 32 two-byte characters — 32 characters but exactly 64 bytes.
 *
 * This is the case a character-count check gets wrong in the permissive
 * direction's opposite: it looks half the length of the limit and is exactly
 * at it.
 */
export const multibyteNameAtLimit = "é".repeat(32);

/**
 * 64 two-byte characters — 64 characters but 128 bytes.
 *
 * The SDK's own guard uses `String.length`, so this passes it and then fails
 * inside the XDR writer with `got 64 bytes, max allowed is 64`. Validating by
 * bytes up front is what turns that into a usable message.
 */
export const multibyteNameOverLimit = "é".repeat(64);

/** A four-byte character, to prove emoji are counted correctly. */
export const emojiName = "🦝";

/** 64 bytes of hex — exactly at the value limit. */
export const hexValueAtLimit = "ab".repeat(64);

/** 65 bytes of hex — one over. */
export const hexValueOverLimit = "ab".repeat(65);

/** Bytes that are not valid UTF-8 at all. */
export const binaryHexValue = "fffefdfc";

/** Hex for "A", NUL, "B" — valid UTF-8, but with a control character in it. */
export const controlBytesHexValue = "410042";

/** Base64 for the three bytes 0x01 0x02 0x03. */
export const base64Value = "AQID";

export const oddLengthHex = "abc";
export const nonHexValue = "zzzz";
export const malformedBase64 = "AQI";

/** Longer than the raw-input cap, before any decoding is attempted. */
export const oversizedRawValue = "a".repeat(4_097);

/**
 * A secret seed, used only to prove the workbench treats it as ordinary text
 * rather than as a key: this tool never accepts an address or a signer, so a
 * seed pasted here must not be decoded, validated or echoed as a key.
 */
export const secretSeed = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 1)).secret();
