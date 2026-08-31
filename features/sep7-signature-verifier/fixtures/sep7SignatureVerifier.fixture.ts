import { Keypair } from "@stellar/stellar-sdk";
import type { Sep7SignatureVerifierResult } from "@/features/sep7-signature-verifier/types";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));
export const signingPair = seed(7);
export const signingKey = signingPair.publicKey();
export const destination = seed(8).publicKey();
export const DOMAIN = "example.com";
export const TOML_URL = `https://${DOMAIN}/.well-known/stellar.toml`;
export const unsignedUri = `web+stellar:pay?destination=${destination}&amount=1&origin_domain=${DOMAIN}`;
const prefix = Buffer.alloc(36); prefix[35] = 4;
export const signedPayload = Buffer.concat([prefix, Buffer.from(`stellar.sep.7 - URI Scheme${unsignedUri}`)]);
export const signature = signingPair.sign(signedPayload).toString("base64");
export const signedUri = `${unsignedUri}&signature=${encodeURIComponent(signature)}`;
export const tomlWithSigningKey = `VERSION="2.0.0"\nURI_REQUEST_SIGNING_KEY="${signingKey}"\n`;
export const tomlWithoutSigningKey = `VERSION="2.0.0"\n`;
export const sep7SignatureVerifierFixture: Sep7SignatureVerifierResult = { originDomain: DOMAIN, tomlUrl: TOML_URL, signingKey, verified: true };
