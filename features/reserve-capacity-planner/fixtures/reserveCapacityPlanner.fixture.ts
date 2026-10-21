import { Keypair } from "@stellar/stellar-sdk";
import type { ReserveCapacityPlannerRawInput, ReserveCapacityPlannerResult } from "@/features/reserve-capacity-planner/types";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

/**
 * Derived only to prove the planner never needs an account id.
 * The projection does not query this address.
 */
export const unqueriedAccountId = seed(9).publicKey();

/**
 * 1 + 2 + 3 + 4 = 10 subentries.
 * Default base reserve 5,000,000 stroops.
 * Minimum = 5,000,000 × (2 + 10) = 60,000,000 stroops = 6.0000000 XLM.
 * Starting balance 10 XLM = 100,000,000 stroops.
 * Spendable = 100,000,000 − 60,000,000 = 40,000,000 stroops = 4.0000000 XLM.
 */
export const normalRaw: ReserveCapacityPlannerRawInput = {
  trustlines: "1",
  offers: "2",
  dataEntries: "3",
  signers: "4",
  baseReserve: "",
  startingBalance: "10"
};

export const normalExpected: ReserveCapacityPlannerResult = {
  trustlines: "1",
  offers: "2",
  dataEntries: "3",
  signers: "4",
  subentryCount: "10",
  baseReserveXlm: "0.5000000",
  baseReserveStroops: "5000000",
  baseReserveOverridden: false,
  minimumBalanceXlm: "6.0000000",
  minimumBalanceStroops: "60000000",
  accountReserveXlm: "1.0000000",
  accountReserveStroops: "10000000",
  subentryReserveXlm: "5.0000000",
  subentryReserveStroops: "50000000",
  startingBalanceXlm: "10.0000000",
  spendableBalanceXlm: "4.0000000",
  spendableBalanceStroops: "40000000",
  belowMinimum: false,
  shortfallXlm: "0.0000000"
};
