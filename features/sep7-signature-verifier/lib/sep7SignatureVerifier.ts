import { StrKey, Keypair } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { Sep7TomlUnreachableError, toSep7SignatureVerifierErrorCode } from "@/features/sep7-signature-verifier/lib/sep7SignatureVerifier.errors";
import type { Sep7SignatureVerifierErrorCode, Sep7SignatureVerifierInput, Sep7SignatureVerifierResult } from "@/features/sep7-signature-verifier/types";

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runSep7SignatureVerifier(
  input: Sep7SignatureVerifierInput,
  _network: StellarNetwork,
  signal?: AbortSignal,
  fetchImpl: typeof fetch = globalThis.fetch
): Promise<Result<Sep7SignatureVerifierResult, Sep7SignatureVerifierErrorCode>> {
  const tomlUrl = `https://${input.originDomain}/.well-known/stellar.toml`;
  let response: Response;
  try {
    if (signal?.aborted) throw new Sep7TomlUnreachableError();
    response = await fetchImpl(tomlUrl, { signal });
  } catch {
    // A response with an HTTP error is `toml_unreachable`; a transport
    // exception or timeout is the broader request_failed fallback.
    return err("request_failed");
  }
  if (!response.ok) return err("toml_unreachable");

  let toml: string;
  try {
    toml = await response.text();
  } catch (error) {
    return err(toSep7SignatureVerifierErrorCode(error));
  }
  const match = toml.match(/^\s*URI_REQUEST_SIGNING_KEY\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s#]+))\s*(?:#.*)?$/m);
  const signingKey = (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
  if (!signingKey) return err("no_signing_key");
  try {
    if (!StrKey.isValidEd25519PublicKey(signingKey)) return err("invalid_signing_key");
  } catch {
    return err("invalid_signing_key");
  }

  let signature: Buffer;
  try {
    signature = Buffer.from(input.signature, "base64");
    if (signature.length !== 64) return err("signature_invalid");
  } catch {
    return err("signature_invalid");
  }
  const prefix = Buffer.alloc(36);
  prefix[35] = 4;
  const payload = Buffer.concat([
    prefix,
    Buffer.from(`stellar.sep.7 - URI Scheme${input.unsignedUri}`, "utf8")
  ]);
  try {
    const valid = Keypair.fromPublicKey(signingKey).verify(payload, signature);
    if (!valid) return err("signature_invalid");
  } catch {
    return err("signature_invalid");
  }
  return ok({ originDomain: input.originDomain, tomlUrl, signingKey, verified: true });
}
