import { err, ok, type Result } from "@/core/result/result";
import { encodeMuxedAccountToAddress, StrKey, xdr } from "@stellar/stellar-sdk";
import type { StellarNetwork } from "@/core/network/types";
import type { Sep10InspectorErrorCode, Sep10InspectorInput, Sep10InspectorResult, Sep10Rule } from "@/features/sep10-inspector/types";

function member<T = unknown>(value: unknown, name: string): T | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = (value as Record<string, unknown>)[name];
  return (typeof candidate === "function" ? candidate.call(value) : candidate) as T | undefined;
}

function variantName(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const switchMethod = (value as { switch?: () => { name?: string } }).switch;
  if (typeof switchMethod === "function") return switchMethod.call(value)?.name;
  const type = (value as { type?: unknown }).type;
  if (typeof type === "string") return type;
  if (type && typeof type === "object" && typeof (type as { name?: unknown }).name === "string") return (type as { name: string }).name;
  return undefined;
}

function bytes(value: unknown): Uint8Array | undefined {
  if (value instanceof Uint8Array) return value;
  if (!value || typeof value !== "object") return undefined;
  const nested = (value as { value?: unknown; bytes?: unknown }).value ?? (value as { bytes?: unknown }).bytes;
  if (nested instanceof Uint8Array) return nested;
  return undefined;
}

function textValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  const raw = bytes(value);
  if (raw) return new TextDecoder("utf-8", { fatal: false }).decode(raw);
  if (value && typeof value === "object" && "toString" in value) return String(value);
  return undefined;
}

function stringValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "bigint" || typeof value === "number") return String(value);
  if (value && typeof value === "object" && "toString" in value) return String(value);
  return undefined;
}

function parseTime(value: unknown): string | undefined {
  const text = stringValue(value);
  return text && /^\d+$/.test(text) ? text : undefined;
}

/** Inspect a SEP-10 challenge envelope without contacting Horizon or TOML. */
export function inspectSep10Challenge(envelopeXdr: string, nowSeconds = Math.floor(Date.now() / 1000)): Result<Sep10InspectorResult, Sep10InspectorErrorCode> {
  let transaction: any;
  try {
    const envelope = xdr.TransactionEnvelope.fromXDR(envelopeXdr, "base64");
    const envelopeType = variantName(envelope);
    if (envelopeType === "envelopeTypeTx") {
      const v1 = member(envelope, "v1");
      transaction = member(v1, "tx");
    } else if (envelopeType === "envelopeTypeTxV0") {
      const v0 = member(envelope, "v0");
      transaction = member(v0, "tx");
    } else if (envelopeType === "envelopeTypeTxFeeBump") {
      const feeBump = member(envelope, "feeBump");
      const feeBumpTx = member(feeBump, "tx");
      const inner = member(feeBumpTx, "innerTx");
      if (variantName(inner) !== "envelopeTypeTx") return err("not_a_challenge");
      const v1 = member(inner, "v1");
      transaction = member(v1, "tx");
    } else return err("not_a_challenge");
    if (!transaction) return err("invalid_xdr");
  } catch {
    return err("invalid_xdr");
  }

  const operationList = member<unknown[]>(transaction, "operations") ?? [];
  const operations = Array.isArray(operationList) ? operationList : [];
  const cond = member(transaction, "cond");
  const condType = variantName(cond);
  const bounds = condType === "precondTime"
    ? member(cond, "timeBounds")
    : condType === "precondV2"
      ? member(member(cond, "v2"), "timeBounds")
      : member(transaction, "timeBounds");
  const minTime = parseTime(member(bounds, "minTime"));
  const maxTime = parseTime(member(bounds, "maxTime"));
  const sequence = stringValue(member(transaction, "seqNum") ?? member(transaction, "sequence")) ?? "0";
  const rules: Sep10Rule[] = [];
  const operationDetails = operations.map((operation: any) => {
    const body = member(operation, "body");
    const bodyType = variantName(body);
    if (!body || bodyType !== "manageData") return { type: bodyType ?? "unknown" };
    const manage = member(body, "manageDataOp");
    if (!manage) return { type: bodyType };
    const value = member(manage, "dataValue");
    const name = textValue(member(manage, "dataName"));
    return { type: "manageData", name, value: value ? textValue(value) : undefined, source: textValue(member(operation, "sourceAccount")) };
  });
  const manageData = operationDetails.filter((operation) => operation.type === "manageData");
  const names = manageData.map((operation) => String(operation.name ?? ""));
  const home = manageData.find((operation) => operation.name === "home_domain");
  const web = manageData.find((operation) => operation.name === "web_auth_domain");
  const status = (valid: boolean): "pass" | "fail" => valid ? "pass" : "fail";
  const sourceEd25519 = member(transaction, "sourceAccountEd25519");
  const sourceAccount = member(transaction, "sourceAccount");
  let source = "";
  if (sourceEd25519) {
    const raw = bytes(sourceEd25519);
    if (raw) source = StrKey.encodeEd25519PublicKey(raw);
  } else if (sourceAccount) {
    try {
      source = (encodeMuxedAccountToAddress as unknown as (account: unknown, includeMuxed?: boolean) => string)(sourceAccount, true);
    } catch {
      const raw = bytes(member(sourceAccount, "ed25519"));
      if (raw) source = StrKey.encodeEd25519PublicKey(raw);
    }
  }

  rules.push({ name: "nonzero_sequence", status: status(sequence !== "0"), detail: `Sequence is ${sequence}; challenge transactions must not use sequence 0.` });
  rules.push({ name: "manage_data_operations", status: status(manageData.length >= 2), detail: `${manageData.length} ManageData operation(s) found.` });
  rules.push({ name: "home_domain", status: status(Boolean(home?.value)), detail: home?.value ? "home_domain value is present." : "home_domain ManageData value is missing." });
  rules.push({ name: "web_auth_domain", status: status(Boolean(web?.value)), detail: web?.value ? "web_auth_domain value is present." : "web_auth_domain ManageData value is missing." });
  const orderedBounds = Boolean(minTime && maxTime) && Number(minTime) <= Number(maxTime);
  rules.push({ name: "time_bounds", status: status(orderedBounds), detail: orderedBounds ? `Valid bounds ${minTime}-${maxTime}.` : "Time bounds are missing, malformed or reversed." });
  const expires = maxTime ? Number(maxTime) : Number.NaN;
  rules.push({ name: "not_expired", status: status(Number.isFinite(expires) && expires >= nowSeconds), detail: Number.isFinite(expires) ? `Expires at ${expires}.` : "Expiration could not be read." });
  rules.push({ name: "server_signing_account", status: status(StrKey.isValidEd25519PublicKey(source)), detail: StrKey.isValidEd25519PublicKey(source) ? "Source is a valid server signing account." : "Source account is not a valid Stellar public key." });

  if (names.length < 2 || !home || !web) return err("not_a_challenge");
  if (!orderedBounds || !/^[0-9]+$/.test(sequence) || !StrKey.isValidEd25519PublicKey(source)) return err("malformed_challenge");
  if (expires < nowSeconds) return err("expired_challenge");

  const valid = rules.every((rule) => rule.status === "pass");
  return ok({
    summary: valid ? "SEP-10 challenge structure is valid." : "SEP-10 challenge failed one or more structural rules.",
    valid,
    sequence,
    serverSigningAccount: source,
    timeBounds: { minTime: minTime ?? "0", maxTime: maxTime ?? "0" },
    operations: operationDetails,
    rules,
    network: member(transaction, "networkPassphrase") ? String(member(transaction, "networkPassphrase")) : undefined,
  });
}

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runSep10Inspector(
  input: Sep10InspectorInput,
  _network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<Sep10InspectorResult, Sep10InspectorErrorCode>> {
  return inspectSep10Challenge(input.xdr);
}
