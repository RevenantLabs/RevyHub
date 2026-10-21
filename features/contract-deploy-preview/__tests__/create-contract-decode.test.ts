import { describe, expect, it } from "vitest";
import { Account, Asset, Keypair, Networks, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { findCreateContractHostFunction } from "../lib/create-contract-decode";
import { sample } from "../fixtures/contractDeployPreview.fixture";

const sourceKeypair = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 5));
const sourceAccountId = sourceKeypair.publicKey();

function envelopeWithOperation(operation: ReturnType<typeof Operation.payment>): string {
  const account = new Account(sourceAccountId, "400");
  return new TransactionBuilder(account, { fee: "100", networkPassphrase: Networks.TESTNET })
    .addOperation(operation)
    .setTimeout(30)
    .build()
    .toXDR();
}

describe("findCreateContractHostFunction", () => {
  it("finds a CreateContractV2 host function", () => {
    const result = findCreateContractHostFunction(sample.envelope);
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.isV2).toBe(true);
    expect(result.ok && result.value.constructorArgs).toHaveLength(2);
  });

  it("returns no_create_contract_operation with the operation types found, for an envelope with no host function", () => {
    const envelope = envelopeWithOperation(
      Operation.payment({ destination: sourceAccountId, asset: Asset.native(), amount: "1" })
    );
    const result = findCreateContractHostFunction(envelope);
    expect(!result.ok && result.code).toBe("no_create_contract_operation");
    expect(!result.ok && result.detail).toEqual(["payment"]);
  });

  it("returns invalid_xdr for garbage input", () => {
    const result = findCreateContractHostFunction("not-valid-xdr-at-all");
    expect(!result.ok && result.code).toBe("invalid_xdr");
  });
});
