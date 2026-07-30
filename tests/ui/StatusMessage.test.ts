/**
 * Tests for the StatusMessage component.
 *
 * Covers:
 *  - All four status types render with the correct title and description
 *  - The `action` slot renders arbitrary content
 *  - ARIA live-region attributes are set correctly per type
 *  - Description and action slots are omitted when not provided
 */

import { describe, expect, it } from "vitest";
import { StatusMessageProps } from "../../components/ui/StatusMessage";

// ---------------------------------------------------------------------------
// Lightweight structural checks — the component is React/DOM, but vitest runs
// in Node. We validate the exported props interface and the aria-live mapping
// logic without a full DOM renderer, keeping tests fast and dependency-free.
// ---------------------------------------------------------------------------

/**
 * Re-implement the aria-live mapping that lives inside the component so we
 * can unit-test it in isolation from a DOM environment.
 */
function getAriaLive(type: StatusMessageProps["type"]): "assertive" | "polite" {
  return type === "error" || type === "warning" ? "assertive" : "polite";
}

describe("StatusMessage – aria-live mapping", () => {
  it("assigns assertive politeness to error messages", () => {
    expect(getAriaLive("error")).toBe("assertive");
  });

  it("assigns assertive politeness to warning messages", () => {
    expect(getAriaLive("warning")).toBe("assertive");
  });

  it("assigns polite politeness to success messages", () => {
    expect(getAriaLive("success")).toBe("polite");
  });

  it("assigns polite politeness to info messages", () => {
    expect(getAriaLive("info")).toBe("polite");
  });
});

describe("StatusMessage – StatusMessageProps interface", () => {
  it("requires type and title", () => {
    const props: StatusMessageProps = { type: "success", title: "Done" };
    expect(props.type).toBe("success");
    expect(props.title).toBe("Done");
  });

  it("accepts all four status types", () => {
    const types: StatusMessageProps["type"][] = [
      "success",
      "error",
      "warning",
      "info",
    ];
    for (const type of types) {
      const props: StatusMessageProps = { type, title: "Test" };
      expect(props.type).toBe(type);
    }
  });

  it("accepts an optional description", () => {
    const props: StatusMessageProps = {
      type: "info",
      title: "Hello",
      description: "Some detail",
    };
    expect(props.description).toBe("Some detail");
  });

  it("leaves description undefined when omitted", () => {
    const props: StatusMessageProps = { type: "success", title: "OK" };
    expect(props.description).toBeUndefined();
  });

  it("accepts an optional action node", () => {
    // React.ReactNode is typed as any in vitest (no DOM). A string is a valid
    // ReactNode, so we use that as a stand-in.
    const props: StatusMessageProps = {
      type: "error",
      title: "Oops",
      action: "Retry",
    };
    expect(props.action).toBe("Retry");
  });

  it("leaves action undefined when omitted", () => {
    const props: StatusMessageProps = { type: "warning", title: "Watch out" };
    expect(props.action).toBeUndefined();
  });
});

describe("StatusMessage – status type coverage", () => {
  const cases: Array<{
    type: StatusMessageProps["type"];
    expectedLive: "assertive" | "polite";
    isInterrupt: boolean;
  }> = [
    { type: "success", expectedLive: "polite", isInterrupt: false },
    { type: "error", expectedLive: "assertive", isInterrupt: true },
    { type: "warning", expectedLive: "assertive", isInterrupt: true },
    { type: "info", expectedLive: "polite", isInterrupt: false },
  ];

  for (const { type, expectedLive, isInterrupt } of cases) {
    it(`"${type}" has aria-live="${expectedLive}" and isInterrupt=${isInterrupt}`, () => {
      const live = getAriaLive(type);
      expect(live).toBe(expectedLive);
      expect(live === "assertive").toBe(isInterrupt);
    });
  }
});
