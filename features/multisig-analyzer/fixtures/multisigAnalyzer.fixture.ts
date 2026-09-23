import {
  Account,
  Asset,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder
} from "@stellar/stellar-sdk";
import type { MultisigAnalyzerResult, MultisigSigner } from "@/features/multisig-analyzer/types";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const sourceAccountSeed = seed(11);
export const transactionSourceAccountSeed = seed(12);
export const altSourceAccountSeed = seed(13);
export const secondSignerSeed = seed(14);
export const thirdSignerSeed = seed(15);

export const sourceAccountId = sourceAccountSeed.publicKey();
export const transactionSourceAccountId = transactionSourceAccountSeed.publicKey();
export const altSourceAccountId = altSourceAccountSeed.publicKey();
export const secondSignerKey = secondSignerSeed.publicKey();
export const thirdSignerKey = thirdSignerSeed.publicKey();

const SIGNER_KEYPAIRS = new Map<string, Keypair>([
  [sourceAccountId, sourceAccountSeed],
  [transactionSourceAccountId, transactionSourceAccountSeed],
  [altSourceAccountId, altSourceAccountSeed],
  [secondSignerKey, secondSignerSeed],
  [thirdSignerKey, thirdSignerSeed]
]);

function resolveKeypair(signer: Keypair | { key: string }): Keypair {
  if (signer instanceof Keypair) return signer;

  const match = SIGNER_KEYPAIRS.get(signer.key);
  if (!match) {
    throw new Error(`No test keypair configured for signer ${signer.key}`);
  }

  return match;
}

export const sourceAccountResponse = {
  id: sourceAccountId,
  account_id: sourceAccountId,
  thresholds: { low_threshold: 1, med_threshold: 3, high_threshold: 5 },
  signers: [
    { key: sourceAccountId, weight: 1, type: "ed25519_public_key" },
    { key: secondSignerKey, weight: 2, type: "ed25519_public_key" },
    { key: thirdSignerKey, weight: 2, type: "ed25519_public_key" }
  ]
};

export const buildTestEnvelope = ({
  sourceAccountId: txSource,
  signers = [sourceAccountSeed, secondSignerSeed, thirdSignerSeed],
  operationSourceAccountId = txSource,
  operationSourceSigners = signers
}: {
  sourceAccountId: string;
  signers?: Array<Keypair | { key: string; weight?: number | string; type?: string }>;
  operationSourceAccountId?: string;
  operationSourceSigners?: Array<Keypair | { key: string; weight?: number | string; type?: string }>;
} = { sourceAccountId: transactionSourceAccountId }): string => {
  const builder = new TransactionBuilder(new Account(txSource, "1"), {
    fee: "100",
    networkPassphrase: Networks.TESTNET
  });

  builder.addOperation(
    Operation.payment({
      destination: operationSourceAccountId,
      amount: "10",
      asset: Asset.native(),
      source: operationSourceAccountId
    })
  );

  const tx = builder.setTimeout(0).build();
  tx.sign(...signers.map((signer) => resolveKeypair(signer)));
  return tx.toEnvelope().toXDR("base64");
};

export const multisigAnalyzerFixture: MultisigAnalyzerResult = {
  sourceAccount: sourceAccountId,
  transactionSourceAccount: transactionSourceAccountId,
  requiredThreshold: "medium",
  requiredWeight: "3",
  signatureWeight: "3",
  availableWeight: "3",
  shortfallWeight: "0",
  missingSigners: [],
  unattributedSignatures: [],
  signers: [
    { key: sourceAccountId, weight: "1", type: "ed25519_public_key", isMaster: true },
    { key: secondSignerKey, weight: "2", type: "ed25519_public_key", isMaster: false },
    { key: thirdSignerKey, weight: "2", type: "ed25519_public_key", isMaster: false }
  ] satisfies MultisigSigner[],
  thresholds: { low: "1", medium: "3", high: "5" },
  operations: []
};
