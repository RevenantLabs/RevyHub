import type { LedgerHeaderDecoderResult } from "@/features/ledger-header-decoder/types";
import { standardHeaderXdr } from "@/features/ledger-header-decoder/fixtures/standard-header.fixture";

export const ledgerHeaderXdr = standardHeaderXdr;
export const expectedHeader: LedgerHeaderDecoderResult = {
  protocolVersion: "23",
  ledgerSequence: "123456",
  baseFee: "100",
  baseReserve: "5000000",
  scpValue: {
    txSetHash: Buffer.alloc(32, 0x11).toString("hex"),
    closeTime: "1760000000",
    upgrades: []
  }
};
