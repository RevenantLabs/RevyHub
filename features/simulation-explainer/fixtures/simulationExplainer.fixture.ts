import {
  Keypair,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  Account,
  xdr,
  StrKey,
  SorobanDataBuilder
} from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const sourceAccountId = seed(1).publicKey();
export const destinationAccountId = seed(2).publicKey();
export const contractId = StrKey.encodeContract(Buffer.alloc(32, 9));

/**
 * Builds a deterministic, valid Stellar transaction envelope XDR.
 *
 * This is a vanilla payment envelope used to exercise validation and the
 * simulate-transaction request path in tests.
 */
export function buildTransactionEnvelopeXdr(): string {
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

export const validTransactionXdr = buildTransactionEnvelopeXdr();

export const latestLedger = 1_000_000;

/**
 * Builds a deterministic SorobanTransactionData XDR with known resource values.
 *
 * Uses SorobanDataBuilder so the fixture stays compatible with the SDK's
 * XDR helpers regardless of internal struct naming.
 */
export function buildSorobanTransactionDataXdr(): string {
  const readOnly = xdr.LedgerKey.account(
    new xdr.LedgerKeyAccount({
      accountId: xdr.PublicKey.publicKeyTypeEd25519(seed(3).rawPublicKey())
    })
  );
  const readWrite = xdr.LedgerKey.account(
    new xdr.LedgerKeyAccount({
      accountId: xdr.PublicKey.publicKeyTypeEd25519(seed(4).rawPublicKey())
    })
  );

  return new SorobanDataBuilder()
    .setReadOnly([readOnly])
    .setReadWrite([readWrite])
    .setResources(1000, 200, 300)
    .setResourceFee("12345")
    .build()
    .toXDR("base64");
}

/** Builds a deterministic SorobanAuthorizationEntry for account credentials. */
export function buildAccountAuthEntryXdr(): string {
  // The generated TypeScript bindings for the nested XDR structs are not
  // exported by name, so we reach through the union arm types at runtime.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const InvokeContractArgs = (xdr.SorobanAuthorizedFunction as any)
    .sorobanAuthorizedFunctionTypeContractFn()._armType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SorobanAddressCredentials = (xdr.SorobanCredentials as any)
    .sorobanCredentialsAddress()._armType;

  const addressCredentials = new SorobanAddressCredentials({
    address: xdr.ScAddress.scAddressTypeAccount(
      xdr.PublicKey.publicKeyTypeEd25519(seed(1).rawPublicKey())
    ),
    nonce: xdr.Int64.fromString("123456789"),
    signatureExpirationLedger: latestLedger + 1000,
    signature: xdr.ScVal.scvVec([xdr.ScVal.scvSymbol("signed")])
  });

  const contractFn = new InvokeContractArgs({
    contractAddress: xdr.ScAddress.scAddressTypeContract(StrKey.decodeContract(contractId)),
    functionName: "increment",
    args: []
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authEntry = new (xdr.SorobanAuthorizationEntry as any)({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(addressCredentials as any),
    rootInvocation: new xdr.SorobanAuthorizedInvocation({
      function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contractFn as any
      ),
      subInvocations: []
    })
  });

  return authEntry.toXDR("base64");
}

/** A realistic `simulateTransaction` success response. */
export function simulationSuccessResponse(): {
  transactionData: string;
  events: string[];
  minResourceFee: string;
  results: { auth: string[]; xdr: string | null }[];
  cost: { cpuInsns: string; memBytes: string };
  latestLedger: number;
} {
  return {
    transactionData: buildSorobanTransactionDataXdr(),
    events: [],
    minResourceFee: "12345",
    results: [{ auth: [buildAccountAuthEntryXdr()], xdr: null }],
    cost: { cpuInsns: "1000", memBytes: "2000" },
    latestLedger
  };
}

/** A `simulateTransaction` response where the transaction would fail. */
export function simulationFailureResponse(): {
  error: { code: string; message: string };
  latestLedger: number;
} {
  return {
    error: { code: "TRANSACTION_SIMULATION_FAILED", message: "Simulation identified an error" },
    latestLedger
  };
}

/** A `simulateTransaction` response requiring archived state restore. */
export function simulationRestoreResponse(): {
  restorePreamble: { minResourceFee: string; transactionData: string };
  latestLedger: number;
} {
  return {
    restorePreamble: { minResourceFee: "50000", transactionData: "" },
    latestLedger
  };
}
