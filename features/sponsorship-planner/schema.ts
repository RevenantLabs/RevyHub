import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  SponsorshipPlannerErrorCode,
  SponsorshipPlannerField,
  SponsorshipPlannerInput
} from "@/features/sponsorship-planner/types";

/** Parses two raw form fields into a validated request, without throwing. */
export function parseSponsorshipPlannerInput(
  rawSponsor: string,
  rawSponsored: string
): Result<SponsorshipPlannerInput, SponsorshipPlannerErrorCode> {
  const sponsorAccountId = rawSponsor.replace(/\s+/g, "");
  const sponsoredAccountId = rawSponsored.replace(/\s+/g, "");

  if (!sponsorAccountId) return err("empty_sponsor");
  if (!sponsoredAccountId) return err("empty_sponsored");

  // Secret seeds are rejected on the prefix before any checksum work, so a
  // pasted key is never parsed, echoed, stored or transmitted.
  if (sponsorAccountId.startsWith("S")) return err("invalid_sponsor");
  if (sponsoredAccountId.startsWith("S")) return err("invalid_sponsored");

  if (!StrKey.isValidEd25519PublicKey(sponsorAccountId)) return err("invalid_sponsor");
  if (!StrKey.isValidEd25519PublicKey(sponsoredAccountId)) return err("invalid_sponsored");

  if (sponsorAccountId === sponsoredAccountId) return err("same_account");

  return ok({ sponsorAccountId, sponsoredAccountId });
}

/** Maps an error code onto the form field it belongs to, if any. */
export function errorFieldFor(
  code: SponsorshipPlannerErrorCode
): SponsorshipPlannerField | undefined {
  if (code === "empty_sponsor" || code === "invalid_sponsor") return "sponsor";
  if (code === "empty_sponsored" || code === "invalid_sponsored") return "sponsored";
  return undefined;
}
