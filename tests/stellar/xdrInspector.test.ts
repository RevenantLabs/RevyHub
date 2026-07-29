import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Account,
  Asset,
  Keypair,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
  xdr
} from "@stellar/stellar-sdk";
import {
  inspectTransactionXdr,
  MAX_XDR_INPUT_LENGTH
} from "../../lib/stellar/xdrInspector";

const sourceKeypair = Keypair.random();
const destination = Keypair.random().publicKey();

function buildClassicTransaction() {
  return new TransactionBuilder(new Account(sourceKeypair.publicKey(), "123456789"), {
    fee: "200",
    networkPassphrase: Networks.TESTNET,
    memo: Memo.text("fixture memo"),
    timebounds: { minTime: 0, maxTime: 1900000000 }
  })
    .addOperation(
      Operation.payment({ destination, asset: Asset.native(), amount: "12.5" })
    )
    .addOperation(Operation.manageData({ name: "fixture", value: "yes" }))
    .build();
}

function buildUnsignedClassicXdr() {
  return buildClassicTransaction().toEnvelope().toXDR("base64");
}

function buildSignedClassicXdr() {
  const transaction = buildClassicTransaction();
  transaction.sign(sourceKeypair);

  return transaction.toEnvelope().toXDR("base64");
}

function buildFeeBumpXdr() {
  const inner = buildClassicTransaction();
  inner.sign(sourceKeypair);
  const feeBump = TransactionBuilder.buildFeeBumpTransaction(
    Keypair.random(),
    "400",
    inner,
    Networks.TESTNET
  );

  return feeBump.toEnvelope().toXDR("base64");
}

function buildV0Xdr() {
  const v1 = xdr.TransactionEnvelope.fromXDR(buildUnsignedClassicXdr(), "base64").v1().tx();
  const v0 = new xdr.TransactionV0({
    sourceAccountEd25519: sourceKeypair.rawPublicKey(),
    fee: v1.fee(),
    seqNum: v1.seqNum(),
    timeBounds: v1.cond().timeBounds(),
    memo: v1.memo(),
    operations: v1.operations(),
    ext: new xdr.TransactionV0Ext(0)
  });
  const envelope = xdr.TransactionEnvelope.envelopeTypeTxV0(
    new xdr.TransactionV0Envelope({ tx: v0, signatures: [] })
  );

  return envelope.toXDR("base64");
}

describe("inspectTransactionXdr", () => {
  const fetchSpy = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
    fetchSpy.mockClear();
  });

  it("decodes an unsigned classic v1 envelope", () => {
    const result = inspectTransactionXdr(buildUnsignedClassicXdr());

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.summary.variant).toBe("classic-v1");
    expect(result.summary.sourceAccount).toBe(sourceKeypair.publicKey());
    expect(result.summary.sequence).toBe("123456790");
    expect(result.summary.fee).toBe("400");
    expect(result.summary.memo).toEqual({ type: "text", value: "fixture memo" });
    expect(result.summary.preconditions.timeBounds).toEqual({
      minTime: "0",
      maxTime: "1900000000"
    });
    expect(result.summary.operationTypes).toEqual(["payment", "manageData"]);
    expect(result.summary.signatureCount).toBe(0);
    expect(result.summary.feeBump).toBeNull();
  });

  it("counts signatures on a signed envelope", () => {
    const result = inspectTransactionXdr(buildSignedClassicXdr());

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.summary.signatureCount).toBe(1);
    }
  });

  it("decodes a fee-bump envelope with outer fee details", () => {
    const result = inspectTransactionXdr(buildFeeBumpXdr());

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.summary.variant).toBe("fee-bump");
    expect(result.summary.feeBump).not.toBeNull();
    expect(result.summary.feeBump?.totalFee).toBe("1200");
    expect(result.summary.feeBump?.outerSignatureCount).toBe(0);
    expect(result.summary.sourceAccount).toBe(sourceKeypair.publicKey());
    expect(result.summary.signatureCount).toBe(1);
    expect(result.summary.operationTypes).toEqual(["payment", "manageData"]);
  });

  it("decodes a legacy classic v0 envelope", () => {
    const result = inspectTransactionXdr(buildV0Xdr());

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.summary.variant).toBe("classic-v0");
    expect(result.summary.sourceAccount).toBe(sourceKeypair.publicKey());
    expect(result.summary.memo).toEqual({ type: "text", value: "fixture memo" });
    expect(result.summary.signatureCount).toBe(0);
  });

  it("tolerates whitespace and line wrapping in pasted input", () => {
    const wrapped = buildUnsignedClassicXdr().replace(/(.{40})/g, "$1\n");
    const result = inspectTransactionXdr(`  ${wrapped}  `);

    expect(result.ok).toBe(true);
  });

  it("rejects empty input", () => {
    const result = inspectTransactionXdr("   ");

    expect(result).toMatchObject({ ok: false, code: "empty" });
  });

  it("rejects oversized input before decoding", () => {
    const result = inspectTransactionXdr("A".repeat(MAX_XDR_INPUT_LENGTH + 4));

    expect(result).toMatchObject({ ok: false, code: "too-large" });
  });

  it("rejects input that is not base64", () => {
    const result = inspectTransactionXdr("this is not base64!!!");

    expect(result).toMatchObject({ ok: false, code: "invalid-base64" });
  });

  it("rejects base64 that is not a transaction envelope", () => {
    const result = inspectTransactionXdr(Buffer.from("hello stellar").toString("base64"));

    expect(result).toMatchObject({ ok: false, code: "malformed" });
  });

  it("rejects truncated envelope bytes", () => {
    const truncated = Buffer.from(buildUnsignedClassicXdr(), "base64").subarray(0, 40);
    const result = inspectTransactionXdr(truncated.toString("base64"));

    expect(result).toMatchObject({ ok: false, code: "malformed" });
  });
});
