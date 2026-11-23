import { describe, expect, it } from "vitest";
import { formatStroops, formatIdentity } from "../lib/format";
import { muxedDestination } from "../fixtures/boundary.fixture";

describe("lossless formatting", () => {
  it("preserves fractional stroops and the full Int64 range", () => {
    expect(formatStroops("0")).toBe("0.0000000");
    expect(formatStroops("1")).toBe("0.0000001");
    expect(formatStroops("10000001")).toBe("1.0000001");
    expect(formatStroops("9223372036854775807")).toBe("922337203685.4775807");
    expect(formatStroops("-9223372036854775808")).toBe("-922337203685.4775808");
    expect(formatStroops("-1")).toBe("-0.0000001");
  });

  it("preserves full identities, including muxed ids", () => {
    expect(formatIdentity(muxedDestination)).toBe(muxedDestination);
    expect(formatIdentity(muxedDestination)).toHaveLength(69);
  });
});
