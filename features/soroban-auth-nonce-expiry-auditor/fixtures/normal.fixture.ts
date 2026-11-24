import { Address, Keypair, Networks, StrKey, xdr } from "@stellar/stellar-sdk";
export const accountA = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 1)).publicKey();
export const accountB = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 2)).publicKey();
/** A contract (C…) address credential identity, derived rather than hand-typed. */
export const contractC = StrKey.encodeContract(Buffer.alloc(32, 3));
export const networkPassphrase = Networks.TESTNET;
const invocation = new xdr.SorobanAuthorizedInvocation({function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(new xdr.InvokeContractArgs({contractAddress: new Address(accountA).toScAddress(), functionName: "transfer", args: []})), subInvocations: []});
export function addressEntry(address = accountA, nonce = "9223372036854775807", expirationLedger = 100, signed = false): string {
  return new xdr.SorobanAuthorizationEntry({credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(new xdr.SorobanAddressCredentials({address: new Address(address).toScAddress(), nonce: xdr.Int64.fromString(nonce), signatureExpirationLedger: expirationLedger, signature: signed ? xdr.ScVal.scvBytes(Buffer.from([1])) : xdr.ScVal.scvVoid()})), rootInvocation: invocation}).toXDR("base64");
}
export const sourceEntry = new xdr.SorobanAuthorizationEntry({credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(), rootInvocation: invocation}).toXDR("base64");
export const duplicateBundle = [addressEntry(), addressEntry()].join("\n");
