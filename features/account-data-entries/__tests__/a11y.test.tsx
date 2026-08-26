import React from "react";
import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { AccountDataEntriesPanel } from "../components/AccountDataEntriesPanel";
import { AccountDataEntriesResult } from "../components/AccountDataEntriesResult";

describe("AccountDataEntries A11y", () => {
  it("has no a11y violations in initial state", async () => {
    const { container } = renderFeature(<AccountDataEntriesPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no a11y violations in result state", async () => {
    const { container } = renderFeature(<AccountDataEntriesResult result={{ entries: [{
      key: "test", rawBase64: "dGVzdA==", displayType: "text", decodedValue: "test", byteLength: 4
    }] }} />);
    await expectNoAxeViolations(container);
  });
});
