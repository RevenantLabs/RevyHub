/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Keypair,
  xdr,
  StrKey,
  Networks,
  TransactionBuilder,
  Account,
  Operation,
  Asset
} from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const sourceAccountId = seed(1).publicKey();
export const destinationAccountId = seed(2).publicKey();
export const contractId = StrKey.encodeContract(Buffer.alloc(32, 9));
export const nestedContractId = StrKey.encodeContract(Buffer.alloc(32, 10));

const InvokeContractArgs = (xdr.SorobanAuthorizedFunction as any)
  .sorobanAuthorizedFunctionTypeContractFn()._armType;
const SorobanAddressCredentials = (xdr.SorobanCredentials as any)
  .sorobanCredentialsAddress()._armType;

function buildAuthEntry(
  signerSeed: number,
  contractIdValue: string,
  functionName: string,
  args: xdr.ScVal[],
  subInvocations: xdr.SorobanAuthorizedInvocation[] = []
): xdr.SorobanAuthorizationEntry {
  return new xdr.SorobanAuthorizationEntry({
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(
      new SorobanAddressCredentials({
        address: xdr.ScAddress.scAddressTypeAccount(
          xdr.PublicKey.publicKeyTypeEd25519(seed(signerSeed).rawPublicKey())
        ),
        nonce: xdr.Int64.fromString("123456789"),
        signatureExpirationLedger: 2_000_000,
        signature: xdr.ScVal.scvVec([xdr.ScVal.scvSymbol("signed")])
      } as any)
    ),
    rootInvocation: new xdr.SorobanAuthorizedInvocation({
      function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
        new InvokeContractArgs({
          contractAddress: xdr.ScAddress.scAddressTypeContract(
            StrKey.decodeContract(contractIdValue)
          ),
          functionName,
          args
        } as any)
      ),
      subInvocations
    })
  });
}

export function buildAuthTreeEnvelopeXdr(): string {
  const source = seed(1);
  const account = new Account(source.publicKey(), "123456789");

  const nestedInvocation = new xdr.SorobanAuthorizedInvocation({
    function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
      new InvokeContractArgs({
        contractAddress: xdr.ScAddress.scAddressTypeContract(
          StrKey.decodeContract(nestedContractId)
        ),
        functionName: "nested_transfer",
        args: [xdr.ScVal.scvSymbol("nested_arg")]
      } as any)
    ),
    subInvocations: []
  });

  const authEntry = buildAuthEntry(
    1,
    contractId,
    "transfer",
    [xdr.ScVal.scvSymbol("arg1"), xdr.ScVal.scvU32(42)],
    [nestedInvocation]
  );

  const op = Operation.invokeHostFunction({
    func: xdr.HostFunction.hostFunctionTypeInvokeContract(
      new InvokeContractArgs({
        contractAddress: xdr.ScAddress.scAddressTypeContract(StrKey.decodeContract(contractId)),
        functionName: "transfer",
        args: [xdr.ScVal.scvSymbol("arg1")]
      } as any)
    ) as any,
    auth: [authEntry]
  });

  const transaction = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(op)
    .setTimeout(30)
    .build();

  transaction.sign(source);
  return transaction.toXDR();
}

export function buildNoAuthEnvelopeXdr(): string {
  const source = seed(1);
  const account = new Account(source.publicKey(), "123456789");

  const op = Operation.invokeHostFunction({
    func: xdr.HostFunction.hostFunctionTypeInvokeContract(
      new InvokeContractArgs({
        contractAddress: xdr.ScAddress.scAddressTypeContract(StrKey.decodeContract(contractId)),
        functionName: "read_only",
        args: []
      } as any)
    ) as any,
    auth: []
  });

  const transaction = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(op)
    .setTimeout(30)
    .build();

  transaction.sign(source);
  return transaction.toXDR();
}

export function buildPaymentEnvelopeXdr(): string {
  const source = seed(1);
  const destination = seed(2);
  const account = new Account(source.publicKey(), "123456789");

  const transaction = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(
      Operation.payment({
        destination: destination.publicKey(),
        asset: Asset.native(),
        amount: "1"
      })
    )
    .setTimeout(30)
    .build();

  transaction.sign(source);
  return transaction.toXDR();
}
