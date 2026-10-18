import { amountArg, ownerStruct, setOwnerFn, wrongOwnerArg } from "./contract-spec.fixture";

export const nestedSpec = [ownerStruct, setOwnerFn].join("\n");
export const nestedArgs = [amountArg, wrongOwnerArg].join("\n");
export const nestedSample = {
  spec: nestedSpec,
  functionName: "set_owner",
  arguments: nestedArgs
};
