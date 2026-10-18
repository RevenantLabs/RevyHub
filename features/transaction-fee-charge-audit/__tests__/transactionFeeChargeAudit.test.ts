import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { runTransactionFeeChargeAudit } from "@/features/transaction-fee-charge-audit/lib/transactionFeeChargeAudit";
import { handlers } from "@/features/transaction-fee-charge-audit/msw/handlers";
import {
  classicHash,
  feeBumpHash,
  feeBumpOuterMaxFee,
  feeSourceAccount,
  malformedFeeHash,
  missingHash,
  missingLedgerHash,
  sourceAccount
} from "@/features/transaction-fee-charge-audit/fixtures/transactionFeeChargeAudit.fixture";

withMswHandlers(...handlers);

describe("runTransactionFeeChargeAudit", () => {
  it("audits a classic transaction with exact stroop difference", async () => {
    resetHorizonClients();
    const result = await runTransactionFeeChargeAudit({ hash: classicHash }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.envelope.kind).toBe("classic");
    expect(result.value.envelope.fees).toEqual({
      maxFee: "10000",
      feeCharged: "200",
      difference: "9800"
    });
    expect(result.value.operationCount).toBe(2);
    expect(result.value.ledger.sequence).toBe(1_017_696);
    expect(result.value.network).toBe("testnet");
    if (result.value.envelope.kind === "classic") {
      expect(result.value.envelope.sourceAccount).toBe(sourceAccount);
    }
  });

  it("keeps fee-bump outer fee source separate from inner fee fields", async () => {
    resetHorizonClients();
    const result = await runTransactionFeeChargeAudit({ hash: feeBumpHash }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.envelope.kind).toBe("fee_bump");
    if (result.value.envelope.kind !== "fee_bump") return;

    expect(result.value.envelope.outerFeeSource).toBe(feeSourceAccount);
    expect(result.value.envelope.innerSourceAccount).toBe(sourceAccount);
    expect(result.value.envelope.innerFee).toBe("100");
    expect(result.value.envelope.fees.maxFee).toBe(feeBumpOuterMaxFee);
    expect(result.value.envelope.fees.feeCharged).toBe("300");
    expect(BigInt(result.value.envelope.fees.difference)).toBe(
      BigInt(feeBumpOuterMaxFee) - 300n
    );
  });

  it("maps a missing transaction to transaction_not_found", async () => {
    resetHorizonClients();
    const result = await runTransactionFeeChargeAudit({ hash: missingHash }, "testnet");
    expect(result).toEqual({ ok: false, code: "transaction_not_found" });
  });

  it("maps a missing ledger to ledger_not_found", async () => {
    resetHorizonClients();
    const result = await runTransactionFeeChargeAudit({ hash: missingLedgerHash }, "testnet");
    expect(result).toEqual({ ok: false, code: "ledger_not_found" });
  });

  it("reports an incomplete audit when fee fields are malformed", async () => {
    resetHorizonClients();
    const result = await runTransactionFeeChargeAudit({ hash: malformedFeeHash }, "testnet");
    expect(result).toEqual({ ok: false, code: "invalid_fee_data" });
  });
});
