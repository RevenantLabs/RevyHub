// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "../utils/axe";

describe("axe fixture", () => {
  it("detects an introduced serious/critical violation instead of passing trivially", async () => {
    // Intentional, isolated violation: an <img> with no accessible name trips the
    // "image-alt" rule (impact: critical). This is not real app markup — it exists
    // only to prove the axe helper actually fails on real regressions.
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    const { container } = render(<img src="broken.png" />);

    const results = await axe(container);
    const imageAltViolation = results.violations.find((violation) => violation.id === "image-alt");

    expect(imageAltViolation?.impact).toBe("critical");
    expect(() => expect(results).toHaveNoViolations()).toThrow();
  });
});
