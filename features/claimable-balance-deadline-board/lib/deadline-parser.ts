import { err, ok, type Result } from "@/core/result/result";
import type { DeadlineBoardErrorCode, PredicateNode } from "../types";

type ObjectValue = Record<string, unknown>;
const isObject = (value: unknown): value is ObjectValue => typeof value === "object" && value !== null && !Array.isArray(value);

function instant(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (/^\d+$/.test(value)) {
    const seconds = BigInt(value);
    if (seconds > BigInt(Math.floor(Number.MAX_SAFE_INTEGER / 1000))) return undefined;
    const date = new Date(Number(seconds) * 1000);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  // Require an explicit timezone and a real calendar date. Date.parse normalizes
  // values such as February 30, which could otherwise create a false deadline.
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-](\d{2}):(\d{2}))$/.exec(value);
  if (!parts) return undefined;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, , zoneHourText, zoneMinuteText] = parts;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1] ||
    Number(hourText) > 23 || Number(minuteText) > 59 || Number(secondText) > 59 ||
    (zoneHourText && Number(zoneHourText) > 23) ||
    (zoneMinuteText && Number(zoneMinuteText) > 59)) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** creationTime must come from verified creation history, never last_modified_time. */
export function parsePredicate(value: unknown, creationTime?: string, depth = 0): Result<PredicateNode, DeadlineBoardErrorCode> {
  if (!isObject(value) || depth > 16) return err("malformed_predicate");
  const keys = Object.keys(value).filter((key) => !key.endsWith("_epoch"));
  if (keys.length !== 1) return err("malformed_predicate");
  const key = keys[0];
  const epochKey = `${key}_epoch`;
  const allowedEpoch = key === "abs_before" || key === "abs_after";
  if (Object.keys(value).some((field) => field !== key && !(allowedEpoch && field === epochKey))) {
    return err("malformed_predicate");
  }
  if (key === "unconditional") return value.unconditional === true ? ok({ kind: "unconditional" }) : err("malformed_predicate");
  if (key === "and" || key === "or") {
    const children = value[key];
    if (!Array.isArray(children) || children.length !== 2) return err("malformed_predicate");
    const first = parsePredicate(children[0], creationTime, depth + 1);
    const second = parsePredicate(children[1], creationTime, depth + 1);
    if (!first.ok || !second.ok) return err("malformed_predicate");
    return ok({ kind: key, children: [first.value, second.value] });
  }
  if (key === "not") {
    const child = parsePredicate(value.not, creationTime, depth + 1);
    return child.ok ? ok({ kind: "not", child: child.value }) : child;
  }
  if (key === "abs_before" || key === "abs_after") {
    const parsed = instant(value[key]);
    const epoch = value[epochKey];
    if (!parsed || (epoch !== undefined && instant(epoch) !== parsed)) return err("malformed_predicate");
    return ok({ kind: key, value: parsed, instant: parsed });
  }
  if (key === "rel_before" || key === "rel_after") {
    const raw = value[key];
    if ((typeof raw !== "string" && typeof raw !== "number") || !/^\d+$/.test(String(raw))) return err("malformed_predicate");
    const seconds = BigInt(raw);
    if (seconds > BigInt(Math.floor(Number.MAX_SAFE_INTEGER / 1000))) return err("malformed_predicate");
    let deadline: string | undefined;
    if (creationTime) {
      const created = instant(creationTime);
      if (created) {
        const date = new Date(Date.parse(created) + Number(seconds) * 1000);
        if (!Number.isNaN(date.getTime())) deadline = date.toISOString();
      }
    }
    return ok({ kind: key, value: String(raw), ...(deadline ? { instant: deadline } : {}) });
  }
  return err("malformed_predicate");
}

/** Only a single before leaf has one defensible expiry. Compound trees retain their shape. */
export function deadlineFor(node: PredicateNode): { deadline: string; kind: "absolute" | "relative" } | undefined {
  if (node.kind === "abs_before" && node.instant) return { deadline: node.instant, kind: "absolute" };
  if (node.kind === "rel_before" && node.instant) return { deadline: node.instant, kind: "relative" };
  return undefined;
}
