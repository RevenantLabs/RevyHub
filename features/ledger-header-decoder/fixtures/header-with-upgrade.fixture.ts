import { xdr } from "@stellar/stellar-sdk";
import { makeHeader } from "@/features/ledger-header-decoder/fixtures/standard-header.fixture";

const unknown = Buffer.alloc(8);
unknown.writeInt32BE(99, 0);
unknown.writeUInt32BE(0x12345678, 4);

/** Tests the whole list, including a future discriminant unknown to this SDK. */
export const upgradeBytes = [
  xdr.LedgerUpgrade.ledgerUpgradeVersion(24).toXDR(),
  xdr.LedgerUpgrade.ledgerUpgradeBaseFee(200).toXDR(),
  xdr.LedgerUpgrade.ledgerUpgradeBaseReserve(10000000).toXDR(),
  xdr.LedgerUpgrade.ledgerUpgradeMaxTxSetSize(2000).toXDR(),
  xdr.LedgerUpgrade.ledgerUpgradeFlags(1).toXDR(),
  unknown
];
export const headerWithUpgradeXdr = makeHeader(upgradeBytes).toXDR("base64");
