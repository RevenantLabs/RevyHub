import { classicXdr, classicV0Xdr } from "@/features/signing-payload-inspector/fixtures/classic-envelope.fixture";
import { feeBumpXdr } from "@/features/signing-payload-inspector/fixtures/fee-bump-envelope.fixture";

export const signingPayloadFixtures = {
  classicXdr,
  classicV0Xdr,
  feeBumpXdr,
  invalidBase64: "this is not an envelope!",
  nonEnvelopeBase64: Buffer.alloc(32, 7).toString("base64")
} as const;
