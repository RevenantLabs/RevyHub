import { StrKey, xdr } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

export const contractId = StrKey.encodeContract(Buffer.alloc(32, 9));
export const emptyContractId = StrKey.encodeContract(Buffer.alloc(32, 10));
export const topicSymbol = "transfer";
export const topicXdr = xdr.ScVal.scvSymbol(topicSymbol).toXDR("base64");
export const valueXdr = xdr.ScVal.scvU32(7).toXDR("base64");

export const sample = {
  contractIds: contractId,
  eventType: "Contract",
  topics: `sym:${topicSymbol}`,
  startLedger: "150",
  limit: "10",
  cursor: ""
};

export const sampleEvent = {
  id: "event-1",
  type: "contract",
  ledger: 150,
  contractId,
  topic: [topicXdr],
  value: { xdr: valueXdr }
};
