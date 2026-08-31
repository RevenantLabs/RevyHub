import type { IssuerAuthorizationFlags } from "@/features/asset-flags-inspector/types";

export type FlagKey = keyof IssuerAuthorizationFlags;

export const FLAG_ORDER: FlagKey[] = [
  "authRequired",
  "authRevocable",
  "authClawbackEnabled",
  "authImmutable"
];

export const FLAG_LABELS: Record<FlagKey, string> = {
  authRequired: "Authorization required",
  authRevocable: "Authorization revocable",
  authClawbackEnabled: "Clawback enabled",
  authImmutable: "Immutable authorization"
};

export function formatFlagState(enabled: boolean): string {
  return enabled ? "Enabled" : "Disabled";
}

/** One-sentence consequence for a holder when the flag is on or off. */
export function describeFlag(flag: FlagKey, enabled: boolean): string {
  if (flag === "authRequired") {
    return enabled
      ? "Holders must be explicitly approved before they can receive or use this asset."
      : "Anyone with a trustline can hold this asset without issuer approval.";
  }

  if (flag === "authRevocable") {
    return enabled
      ? "The issuer can freeze or unfreeze a holder's balance at any time."
      : "The issuer cannot revoke a holder's authorization once it is granted.";
  }

  if (flag === "authClawbackEnabled") {
    return enabled
      ? "The issuer can claw back this asset from a holder's account, even without their consent."
      : "The issuer cannot pull this asset back from a holder's account.";
  }

  return enabled
    ? "Authorization flags on this account can never be changed — the current settings are permanent."
    : "The issuer can still change its authorization flags later.";
}

export function hasNoSpecialFlags(flags: IssuerAuthorizationFlags): boolean {
  return (
    !flags.authRequired &&
    !flags.authRevocable &&
    !flags.authClawbackEnabled &&
    !flags.authImmutable
  );
}

export function buildSummary(flags: IssuerAuthorizationFlags): string {
  if (hasNoSpecialFlags(flags)) {
    return "This issuing account has no special authorization flags. Assets it issues behave like ordinary Stellar credits with no extra issuer controls over holders.";
  }

  const active = FLAG_ORDER.filter((key) => flags[key]).map((key) => FLAG_LABELS[key]);
  return `This issuing account has ${active.length} authorization flag${active.length === 1 ? "" : "s"} enabled: ${active.join(", ")}.`;
}

export function buildCallouts(flags: IssuerAuthorizationFlags): string[] {
  const callouts: string[] = [
    "These flags apply to assets this account issues, not to assets it holds as a holder."
  ];

  if (flags.authImmutable) {
    callouts.push(
      "Immutable authorization is enabled — the other authorization flags cannot be changed later."
    );
  }

  if (flags.authRequired && flags.authRevocable) {
    callouts.push(
      "Authorization required and authorization revocable together give the issuer full control over who may hold the asset and whether they may keep it."
    );
  }

  if (hasNoSpecialFlags(flags)) {
    callouts.push(
      "With no flags set, this is an ordinary issuing account that does not impose special rules on holders."
    );
  }

  return callouts;
}
