import {
  horizonAccount,
  normalSnapshot,
  PASSPHRASE,
  recoveredRotationXdr,
  finalLockoutXdr
} from "@/features/signer-rotation-impact-auditor/fixtures/normal.fixture";

/**
 * Adverse / incomplete-evidence cases called out in the acceptance criteria.
 */

/** Snapshot missing the signers array entirely. */
export const missingSignersSnapshot = JSON.stringify(
  horizonAccount({ omitSigners: true })
);

/** Snapshot missing thresholds. */
export const missingThresholdsSnapshot = JSON.stringify(
  horizonAccount({ omitThresholds: true })
);

/** Snapshot with neither signers nor thresholds. */
export const emptyEvidenceSnapshot = JSON.stringify(
  horizonAccount({ omitSigners: true, omitThresholds: true })
);

export const incompleteEvidenceInput = {
  accountSnapshot: missingSignersSnapshot,
  envelopeXdr: recoveredRotationXdr,
  networkPassphrase: PASSPHRASE
};

export const finalLockoutInput = {
  accountSnapshot: normalSnapshot,
  envelopeXdr: finalLockoutXdr,
  networkPassphrase: PASSPHRASE
};

export const recoveredInput = {
  accountSnapshot: normalSnapshot,
  envelopeXdr: recoveredRotationXdr,
  networkPassphrase: PASSPHRASE
};

/** Oversized paste used only by schema tests. */
export const oversizedSnapshot = "a".repeat(1_048_577);
export const oversizedEnvelope = "A".repeat(65_537);
