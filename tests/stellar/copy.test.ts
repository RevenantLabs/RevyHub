import { afterEach, describe, expect, it, vi } from "vitest";

describe("copyText", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("throws when navigator.clipboard is not available", async () => {
    vi.stubGlobal("navigator", {});

    const { copyText } = await import("../../lib/copy");

    await expect(copyText("hello")).rejects.toThrow(/Clipboard access is not available/);
  });

  it("writes the value through navigator.clipboard.writeText when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    const { copyText } = await import("../../lib/copy");

    await copyText("abc");

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith("abc");
  });

  it("propagates writeText errors so callers can surface them", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("blocked by permissions"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    const { copyText } = await import("../../lib/copy");

    await expect(copyText("abc")).rejects.toThrow(/blocked by permissions/);
  });
});
