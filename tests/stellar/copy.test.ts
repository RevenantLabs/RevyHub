import { afterEach, describe, expect, it, vi } from "vitest";
import { copyText } from "@/lib/copy";

describe("copyText", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes the value to the clipboard when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });

    await copyText("payload");
    expect(writeText).toHaveBeenCalledWith("payload");
  });

  it("rejects when clipboard access is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined
    });

    await expect(copyText("payload")).rejects.toThrow(
      "Clipboard access is not available in this browser."
    );
  });
});
