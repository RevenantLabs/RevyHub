import { Account, Keypair, Networks, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { runSep10Inspector } from "@/features/sep10-inspector/lib/sep10Inspector";

function challengeXdr() {
  const server = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 1));
  return new TransactionBuilder(new Account(server.publicKey(), "1"), { fee: "100", networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.manageData({ name: "home_domain", value: "anchor.example" }))
    .addOperation(Operation.manageData({ name: "web_auth_domain", value: "auth.anchor.example" }))
    .setTimeout(300)
    .build()
    .toEnvelope()
    .toXDR("base64");
}

describe("runSep10Inspector", () => {
  it("inspects a valid challenge entirely offline", async () => {
    const result = await runSep10Inspector({ xdr: challengeXdr() }, "testnet");
    expect(result.ok && result.value.valid).toBe(true);
    expect(result.ok && result.value.rules.every((rule) => rule.status === "pass")).toBe(true);
  });

  it("rejects an envelope without challenge operations", async () => {
    const result = await runSep10Inspector({ xdr: "YWJj" }, "testnet");
    expect(result).toMatchObject({ ok: false, code: "invalid_xdr" });
  });
});
