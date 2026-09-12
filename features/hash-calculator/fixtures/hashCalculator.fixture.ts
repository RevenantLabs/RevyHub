import {
  Account,
  Asset,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder
} from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

/** Deterministic source account keypair derived from fixed seed. */
export const source = seed(1);

/** Deterministic destination account keypair derived from fixed seed. */
export const destination = seed(2);

/** Deterministic secret key used solely to test rejection of secret keys. */
export const secretKey = seed(9).secret();

/** Deterministic transaction envelope built for testing. */
export const paymentEnvelope = new TransactionBuilder(
  new Account(source.publicKey(), "100"),
  {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
    timebounds: { minTime: 0, maxTime: 0 }
  }
)
  .addOperation(
    Operation.payment({
      destination: destination.publicKey(),
      asset: Asset.native(),
      amount: "10"
    })
  )
  .build();

/** Base64-encoded XDR representation of the test envelope. */
export const validEnvelopeXdr = paymentEnvelope.toXDR();

/** Precomputed testnet hash hex for the valid envelope. */
export const expectedTestnetHashHex =
  "7fc5442b19cd03cd23fa6b0525ae00dca11e3fd7c39c668c5f87bd4f9a844c1b";

/** Precomputed testnet hash base64 for the valid envelope. */
export const expectedTestnetHashBase64 =
  "f8VEKxnNA80j+msFJa4A3KEeP9fDnGaMX4e9T5qETBs=";

/** Precomputed mainnet hash hex for the valid envelope. */
export const expectedPublicHashHex =
  "f16c5bd8d7ec435e3f2732683875a7df3b15a9a479559caa951c476cc6700537";

/** Precomputed mainnet hash base64 for the valid envelope. */
export const expectedPublicHashBase64 =
  "8Wxb2NfsQ14/JzJoOHWn3zsVqaR5VZyqlRxHbMZwBTc=";

/** Test vector for UTF-8 text hashing. */
export const textVector = {
  input: "hello",
  expectedHex: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
  expectedBase64: "LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ="
};

/** Test vector for hexadecimal input hashing. */
export const hexVector = {
  input: "deadbeef",
  expectedHex: "5f78c33274e43fa9de5659265c1d917e25c03722dcb0b8d27db8d5feaa813953",
  expectedBase64: "X3jDMnTkP6neVlkmXB2RfiXANyLcsLjSfbjV/qqBOVM="
};

/** Test vector for base64 input hashing (decodes to 'hello'). */
export const base64Vector = {
  input: "aGVsbG8=",
  expectedHex: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
  expectedBase64: "LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ="
};

/** Invalid XDR string that cannot be decoded as an envelope. */
export const invalidXdrString = "not-a-valid-xdr-envelope";

/** Odd-length hex string that fails hex validation. */
export const invalidHexOdd = "12345";

/** Non-hex character string that fails hex validation. */
export const invalidHexChars = "zztop";

/** Invalid base64 string that fails base64 validation. */
export const invalidBase64 = "???invalid-base64???";
