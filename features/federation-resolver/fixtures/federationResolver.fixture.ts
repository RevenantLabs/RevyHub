import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const resolvedAccountId = seed(1).publicKey();

export const DOMAIN = "example.com";
export const TOML_URL = `https://${DOMAIN}/.well-known/stellar.toml`;
export const FEDERATION_SERVER = "https://federation.example.com/federation";

export const tomlWithFederation = `
VERSION="2.0.0"
FEDERATION_SERVER="${FEDERATION_SERVER}"
SIGNING_KEY="${resolvedAccountId}"
`;

export const tomlWithoutFederation = `VERSION="2.0.0"\nSIGNING_KEY="${resolvedAccountId}"\n`;

export const tomlWithHttpFederation = `FEDERATION_SERVER="http://federation.example.com/federation"\n`;

export const tomlWithBrokenFederation = `FEDERATION_SERVER="not a url"\n`;

/** Single-quoted and bare forms are both legal TOML. */
export const tomlWithSingleQuotes = `FEDERATION_SERVER='${FEDERATION_SERVER}'\n`;
export const tomlWithBareValue = `FEDERATION_SERVER=${FEDERATION_SERVER}\n`;

export const recordWithMemo = {
  stellar_address: `alice*${DOMAIN}`,
  account_id: resolvedAccountId,
  memo_type: "id",
  memo: "12345"
};

export const recordWithoutMemo = {
  stellar_address: `bob*${DOMAIN}`,
  account_id: resolvedAccountId
};

export const recordWithBadAccount = { account_id: "not-a-stellar-key" };
export const recordWithMemoButNoType = { account_id: resolvedAccountId, memo: "12345" };
export const recordWithUnsupportedMemoType = {
  account_id: resolvedAccountId,
  memo_type: "quantum",
  memo: "x"
};
/** Ten rocket emoji: 10 characters, 40 bytes — over the 28-byte text limit. */
export const recordWithOverlongTextMemo = {
  account_id: resolvedAccountId,
  memo_type: "text",
  memo: "🚀".repeat(10)
};
