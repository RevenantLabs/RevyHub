import { describe, expect, it } from "vitest";
import { readHomeDomain, readTomlMemoPolicy } from "@/features/memo-required-checker/lib/home-domain-policy";

describe("home domain memo policy", () => {
  it("reads a published true or false flag", () => {
    expect(readTomlMemoPolicy("MEMO_REQUIRED = true\n")).toEqual({ ok: true, value: "required" });
    expect(readTomlMemoPolicy("# note\nMEMO_REQUIRED = false\n")).toEqual({
      ok: true,
      value: "not_required"
    });
  });

  it("treats a toml with no policy as an absent signal", () => {
    expect(readTomlMemoPolicy('VERSION = "2.0.0"\n')).toEqual({ ok: true, value: "absent" });
  });

  it("rejects a policy value that is not true or false", () => {
    expect(readTomlMemoPolicy("MEMO_REQUIRED = 1\n")).toEqual({ ok: false, code: "request_failed" });
  });

  it("returns null when the account publishes no home domain", () => {
    expect(readHomeDomain({ home_domain: "  " })).toEqual({ ok: true, value: null });
  });
});
