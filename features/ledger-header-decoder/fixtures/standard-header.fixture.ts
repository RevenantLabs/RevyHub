import { xdr } from "@stellar/stellar-sdk";

/** Structurally valid, deterministic LedgerHeader with no proposed upgrades. */
export function makeHeader(upgrades: Buffer[] = []): xdr.LedgerHeader {
  const scpValue = new xdr.StellarValue({
    txSetHash: Buffer.alloc(32, 0x11),
    closeTime: xdr.Uint64.fromString("1760000000"),
    upgrades,
    ext: xdr.StellarValueExt.stellarValueBasic()
  });
  return new xdr.LedgerHeader({
    ledgerVersion: 23,
    previousLedgerHash: Buffer.alloc(32, 0x22),
    scpValue,
    txSetResultHash: Buffer.alloc(32, 0x33),
    bucketListHash: Buffer.alloc(32, 0x44),
    ledgerSeq: 123456,
    totalCoins: xdr.Int64.fromString("100000000000"),
    feePool: xdr.Int64.fromString("0"),
    inflationSeq: 0,
    idPool: xdr.Uint64.fromString("123"),
    baseFee: 100,
    baseReserve: 5000000,
    maxTxSetSize: 1000,
    skipList: [0x55, 0x66, 0x77, 0x88].map((byte) => Buffer.alloc(32, byte)),
    ext: xdr.LedgerHeaderExt.fromXDR(Buffer.alloc(4))
  });
}

export const standardHeaderXdr = makeHeader().toXDR("base64");
