import {
  Account,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder
} from "@stellar/stellar-sdk";

/**
 * Fixtures are derived from fixed raw seeds so checksums are always valid and
 * every case differs in exactly the way its name says.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const accountKey = seed(1);
export const cosigner = seed(2);
export const otherAccount = seed(3);
export const feeSource = seed(4);

export const accountId = accountKey.publicKey();
export const cosignerId = cosigner.publicKey();
export const otherAccountId = otherAccount.publicKey();

export const PASSPHRASE = Networks.TESTNET;
const SEQUENCE = "4370426197114880";

export function horizonAccount(overrides?: {
  signers?: Array<{ key: string; weight: number; type: string }>;
  thresholds?: { low_threshold: number; med_threshold: number; high_threshold: number };
  omitSigners?: boolean;
  omitThresholds?: boolean;
}) {
  const body: Record<string, unknown> = {
    account_id: accountId,
    id: accountId,
    sequence: SEQUENCE,
    subentry_count: 1,
    balances: [{ balance: "100.0000000", asset_type: "native" }],
    flags: {
      auth_required: false,
      auth_revocable: false,
      auth_immutable: false,
      auth_clawback_enabled: false
    },
    data: {}
  };

  if (!overrides?.omitSigners) {
    body.signers = overrides?.signers ?? [
      { key: accountId, weight: 1, type: "ed25519_public_key" },
      { key: cosignerId, weight: 1, type: "ed25519_public_key" }
    ];
  }

  if (!overrides?.omitThresholds) {
    body.thresholds = overrides?.thresholds ?? {
      low_threshold: 1,
      med_threshold: 1,
      high_threshold: 2
    };
  }

  return body;
}

export const normalSnapshot = JSON.stringify(horizonAccount());

function builder(source = accountId) {
  return new TransactionBuilder(new Account(source, SEQUENCE), {
    fee: "100",
    networkPassphrase: PASSPHRASE,
    timebounds: { minTime: 0, maxTime: 0 }
  });
}

/**
 * Safe rotation: add weight to cosigner then raise thresholds that remain
 * reachable with the combined weight.
 */
export const safeRotationXdr = builder()
  .addOperation(
    Operation.setOptions({
      signer: { ed25519PublicKey: cosignerId, weight: 2 }
    })
  )
  .addOperation(
    Operation.setOptions({
      lowThreshold: 1,
      medThreshold: 2,
      highThreshold: 3
    })
  )
  .build()
  .toXDR();

/**
 * Intermediate lockout then recovery: remove cosigner (total weight 1 < high 2),
 * then lower high threshold back to 1.
 */
export const recoveredRotationXdr = builder()
  .addOperation(
    Operation.setOptions({
      signer: { ed25519PublicKey: cosignerId, weight: 0 }
    })
  )
  .addOperation(
    Operation.setOptions({
      highThreshold: 1
    })
  )
  .build()
  .toXDR();

/**
 * Final lockout: disable master and remove cosigner while high stays at 2.
 */
export const finalLockoutXdr = builder()
  .addOperation(Operation.setOptions({ masterWeight: 0 }))
  .addOperation(
    Operation.setOptions({
      signer: { ed25519PublicKey: cosignerId, weight: 0 }
    })
  )
  .build()
  .toXDR();

/** Zero-weight removal of a duplicate-listed cosigner (already weight 1). */
export const zeroWeightRemovalXdr = builder()
  .addOperation(
    Operation.setOptions({
      signer: { ed25519PublicKey: cosignerId, weight: 0 }
    })
  )
  .build()
  .toXDR();

/**
 * Duplicate signer keys in successive ops: first sets weight 5, second sets 2.
 * Final weight must be 2, not 5 or 7.
 */
export const duplicateSignerXdr = builder()
  .addOperation(
    Operation.setOptions({
      signer: { ed25519PublicKey: cosignerId, weight: 5 }
    })
  )
  .addOperation(
    Operation.setOptions({
      signer: { ed25519PublicKey: cosignerId, weight: 2 }
    })
  )
  .build()
  .toXDR();

/** set_options whose source is a different account — must not mutate snapshot. */
export const foreignSourceXdr = builder(otherAccountId)
  .addOperation(
    Operation.setOptions({
      source: otherAccountId,
      masterWeight: 0
    })
  )
  .build()
  .toXDR();

/** Envelope with a non set-options operation. */
export const mixedOpsXdr = builder()
  .addOperation(Operation.bumpSequence({ bumpTo: "4370426197120000" }))
  .addOperation(
    Operation.setOptions({
      signer: { ed25519PublicKey: cosignerId, weight: 2 }
    })
  )
  .build()
  .toXDR();

export const feeBumpSafeXdr = (() => {
  const inner = builder()
    .addOperation(
      Operation.setOptions({
        signer: { ed25519PublicKey: cosignerId, weight: 2 }
      })
    )
    .build();
  inner.sign(accountKey);
  const bump = TransactionBuilder.buildFeeBumpTransaction(
    feeSource,
    "200",
    inner,
    PASSPHRASE
  );
  bump.sign(feeSource);
  return bump.toXDR();
})();

export const notAnEnvelopeXdr = Buffer.alloc(32, 5).toString("base64");
export const notBase64 = "this is definitely not base64!!";
export const secretSeed = accountKey.secret();
export const notAccountJson = JSON.stringify({ foo: "bar" });
