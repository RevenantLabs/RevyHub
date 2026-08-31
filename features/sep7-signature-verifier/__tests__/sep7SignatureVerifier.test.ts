import { describe, expect, it } from "vitest";
import { runSep7SignatureVerifier } from "@/features/sep7-signature-verifier/lib/sep7SignatureVerifier";
import { parseSep7SignatureVerifierInput } from "@/features/sep7-signature-verifier/schema";
import { handlers, tomlHandler } from "@/features/sep7-signature-verifier/msw/handlers";
import { DOMAIN, signedUri, tomlWithoutSigningKey } from "@/features/sep7-signature-verifier/fixtures/sep7SignatureVerifier.fixture";
import { withMswHandlers } from "@/core/testing/msw";

const server = withMswHandlers(...handlers);
describe("runSep7SignatureVerifier", () => {
  it("verifies a URI against the domain's published key", async () => {
    const input = parseSep7SignatureVerifierInput(signedUri);
    if (!input.ok) throw new Error("fixture did not parse");
    expect(await runSep7SignatureVerifier(input.value, "testnet")).toMatchObject({ ok: true, value: { originDomain: DOMAIN } });
  });

  it("distinguishes an invalid signature", async () => {
    const input = parseSep7SignatureVerifierInput(`${signedUri.slice(0, -4)}AAAA`);
    if (!input.ok) throw new Error("fixture did not parse");
    expect(await runSep7SignatureVerifier(input.value, "testnet")).toEqual({ ok: false, code: "signature_invalid" });
  });

  it("reports an absent signing key as unverifiable", async () => {
    server.use(tomlHandler(tomlWithoutSigningKey));
    const input = parseSep7SignatureVerifierInput(signedUri);
    if (!input.ok) throw new Error("fixture did not parse");
    expect(await runSep7SignatureVerifier(input.value, "testnet")).toEqual({ ok: false, code: "no_signing_key" });
  });

  it("reports an unreachable TOML", async () => {
    server.use(tomlHandler("", 503));
    const input = parseSep7SignatureVerifierInput(signedUri);
    if (!input.ok) throw new Error("fixture did not parse");
    expect(await runSep7SignatureVerifier(input.value, "testnet")).toEqual({ ok: false, code: "toml_unreachable" });
  });

  it("rejects an invalid published key", async () => {
    server.use(tomlHandler('URI_REQUEST_SIGNING_KEY="not-a-key"'));
    const input = parseSep7SignatureVerifierInput(signedUri);
    if (!input.ok) throw new Error("fixture did not parse");
    expect(await runSep7SignatureVerifier(input.value, "testnet")).toEqual({ ok: false, code: "invalid_signing_key" });
  });

  it("maps an aborted transport exception to request_failed", async () => {
    const input = parseSep7SignatureVerifierInput(signedUri);
    if (!input.ok) throw new Error("fixture did not parse");
    const fetchImpl = async () => { throw new DOMException("aborted", "AbortError"); };
    expect(await runSep7SignatureVerifier(input.value, "testnet", undefined, fetchImpl)).toEqual({ ok: false, code: "request_failed" });
  });
});
