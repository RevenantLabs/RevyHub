import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { AuditErrorCode, AuditInput, AuditResult, AuditRow } from "../types";
import { classifyExpiry } from "./expiry-readiness";
import { indexNonceReuse, readCredentialEvidence, UnsupportedCredentialError } from "./nonce-reuse-index";
import { decodeErrorCode } from "./sorobanAuthNonceExpiryAuditor.errors";

function toRow(index: number, entry: xdr.SorobanAuthorizationEntry, evaluationLedger: number | null): AuditRow {
  const evidence = readCredentialEvidence(entry.credentials());
  if (evidence.kind === "source-account") {
    return { index, credential: "source-account", address: null, nonce: null, expirationLedger: null, expiry: "unknown", signaturePayloadPresent: null, signatureValidity: "unknown", onChainNonceAvailability: "unknown" };
  }
  return {
    index,
    credential: "address",
    address: evidence.address,
    nonce: evidence.nonce,
    expirationLedger: evidence.signatureExpirationLedger,
    expiry: classifyExpiry(evidence.signatureExpirationLedger, evaluationLedger),
    signaturePayloadPresent: evidence.signaturePayloadPresent,
    signatureValidity: "unknown",
    onChainNonceAvailability: "unknown"
  };
}

export function auditSorobanAuth(input: AuditInput): Result<AuditResult, AuditErrorCode> {
  const rows: AuditRow[] = [];
  for (const [position, encoded] of input.entries.entries()) {
    const bytes = Buffer.from(encoded, "base64");
    let entry: xdr.SorobanAuthorizationEntry;
    try { entry = xdr.SorobanAuthorizationEntry.fromXDR(bytes); }
    catch (error) { return err(decodeErrorCode(error, bytes)); }
    try { rows.push(toRow(position + 1, entry, input.evaluationLedger)); }
    catch (error) { return err(error instanceof UnsupportedCredentialError ? "unsupported_variant" : "malformed_data"); }
  }
  return ok({ networkPassphrase: input.networkPassphrase, evaluationLedger: input.evaluationLedger, rows, reuse: indexNonceReuse(rows, input.networkPassphrase), incompleteEvidence: input.evaluationLedger === null || rows.some((row) => row.credential === "source-account"), provenance: "user-pasted-xdr" });
}
