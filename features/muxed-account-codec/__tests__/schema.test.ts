import { describe, expect, it } from "vitest";
import { parseMuxedAccountCodecInput } from "@/features/muxed-account-codec/schema";
import {
  invalidBaseAddress,
  invalidMuxedAddress,
  largeId,
  maxUint64Id,
  muxedAddressSmallId,
  negativeId,
  overflowId,
  secretSeed,
  smallId,
  validBaseAddress1
} from "@/features/muxed-account-codec/fixtures/muxedAccountCodec.fixture";

describe("parseMuxedAccountCodecInput", () => {
  it("parses valid decode input", () => {
    const parsed = parseMuxedAccountCodecInput({
      mode: "decode",
      muxedAddress: `  ${muxedAddressSmallId}  `
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.mode).toBe("decode");
    expect(parsed.value.muxedAddress).toBe(muxedAddressSmallId);
  });

  it("returns empty_input for empty decode input", () => {
    const parsed = parseMuxedAccountCodecInput({
      mode: "decode",
      muxedAddress: "   "
    });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.code).toBe("empty_input");
  });

  it("rejects invalid M-address in decode mode", () => {
    const parsed = parseMuxedAccountCodecInput({
      mode: "decode",
      muxedAddress: invalidMuxedAddress
    });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.code).toBe("invalid_muxed_address");
  });

  it("rejects secret seed in decode mode", () => {
    const parsed = parseMuxedAccountCodecInput({
      mode: "decode",
      muxedAddress: secretSeed
    });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.code).toBe("invalid_muxed_address");
  });

  it("parses valid encode input", () => {
    const parsed = parseMuxedAccountCodecInput({
      mode: "encode",
      baseAddress: `  ${validBaseAddress1}  `,
      id: `  ${largeId}  `
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.mode).toBe("encode");
    expect(parsed.value.baseAddress).toBe(validBaseAddress1);
    expect(parsed.value.id).toBe(largeId);
  });

  it("returns empty_input when both fields empty in encode mode", () => {
    const parsed = parseMuxedAccountCodecInput({
      mode: "encode",
      baseAddress: "",
      id: ""
    });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.code).toBe("empty_input");
  });

  it("returns invalid_base_address when base address missing", () => {
    const parsed = parseMuxedAccountCodecInput({
      mode: "encode",
      baseAddress: "",
      id: smallId
    });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.code).toBe("invalid_base_address");
  });

  it("returns invalid_base_address for invalid checksum", () => {
    const parsed = parseMuxedAccountCodecInput({
      mode: "encode",
      baseAddress: invalidBaseAddress,
      id: smallId
    });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.code).toBe("invalid_base_address");
  });

  it("rejects secret seed in encode mode", () => {
    const parsed = parseMuxedAccountCodecInput({
      mode: "encode",
      baseAddress: secretSeed,
      id: smallId
    });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.code).toBe("invalid_base_address");
  });

  it("returns invalid_id when id is missing", () => {
    const parsed = parseMuxedAccountCodecInput({
      mode: "encode",
      baseAddress: validBaseAddress1,
      id: ""
    });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.code).toBe("invalid_id");
  });

  it("returns invalid_id for negative or non-numeric id", () => {
    const parsedNegative = parseMuxedAccountCodecInput({
      mode: "encode",
      baseAddress: validBaseAddress1,
      id: negativeId
    });
    expect(parsedNegative.ok).toBe(false);
    if (parsedNegative.ok) return;
    expect(parsedNegative.code).toBe("invalid_id");

    const parsedNonNum = parseMuxedAccountCodecInput({
      mode: "encode",
      baseAddress: validBaseAddress1,
      id: "abc"
    });
    expect(parsedNonNum.ok).toBe(false);
    if (parsedNonNum.ok) return;
    expect(parsedNonNum.code).toBe("invalid_id");
  });

  it("returns invalid_id for uint64 overflow", () => {
    const parsed = parseMuxedAccountCodecInput({
      mode: "encode",
      baseAddress: validBaseAddress1,
      id: overflowId
    });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.code).toBe("invalid_id");
  });

  it("accepts max uint64 id", () => {
    const parsed = parseMuxedAccountCodecInput({
      mode: "encode",
      baseAddress: validBaseAddress1,
      id: maxUint64Id
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.id).toBe(maxUint64Id);
  });

  it("supports string input detection", () => {
    const fromM = parseMuxedAccountCodecInput(muxedAddressSmallId);
    expect(fromM.ok).toBe(true);
    if (!fromM.ok) return;
    expect(fromM.value.mode).toBe("decode");

    const fromG = parseMuxedAccountCodecInput(`${validBaseAddress1}:${smallId}`);
    expect(fromG.ok).toBe(true);
    if (!fromG.ok) return;
    expect(fromG.value.mode).toBe("encode");

    const empty = parseMuxedAccountCodecInput("   ");
    expect(empty.ok).toBe(false);
    if (empty.ok) return;
    expect(empty.code).toBe("empty_input");
  });
});
