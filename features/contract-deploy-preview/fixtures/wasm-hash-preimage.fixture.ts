import { Account, Address, Keypair, Networks, Operation, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

const sourceKeypair = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 2));
const sourceAccountId = sourceKeypair.publicKey();

export const wasmHash = Buffer.alloc(32, 11);
export const salt = Buffer.alloc(32, 13);

/**
 * A genuine classic `CreateContract` (not V2) host function, built from raw
 * XDR rather than `Operation.createCustomContract` — that convenience
 * wrapper always emits `CreateContractArgsV2` (with an empty
 * `constructorArgs` array when none are given), so it cannot produce the
 * older shape this fixture exists to exercise.
 */
export const envelope = (() => {
  const contractIdPreimage = xdr.ContractIdPreimage.contractIdPreimageFromAddress(
    new xdr.ContractIdPreimageFromAddress({ address: new Address(sourceAccountId).toScAddress(), salt })
  );
  const executable = xdr.ContractExecutable.contractExecutableWasm(wasmHash);
  const createContractArgs = new xdr.CreateContractArgs({ contractIdPreimage, executable });
  const hostFunction = xdr.HostFunction.hostFunctionTypeCreateContract(createContractArgs);

  const account = new Account(sourceAccountId, "200");
  const operation = Operation.invokeHostFunction({ func: hostFunction, auth: [] });
  const tx = new TransactionBuilder(account, { fee: "100", networkPassphrase: Networks.TESTNET })
    .addOperation(operation)
    .setTimeout(30)
    .build();
  return tx.toXDR();
})();
