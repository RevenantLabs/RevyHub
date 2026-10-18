import { contractId } from "./sorobanEventFilterComposer.fixture";

export const wildcardFilter = {
  contractIds: contractId,
  eventType: "All",
  topics: "*",
  startLedger: "150",
  limit: "",
  cursor: ""
};

export const tooManyTopics = {
  contractIds: contractId,
  eventType: "All",
  topics: "*,*,*,*,*,*",
  startLedger: "150",
  limit: "10",
  cursor: ""
};
