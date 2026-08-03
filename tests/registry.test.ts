import { describe, expect, it } from "vitest";
import {
  tools,
  toolCategories,
  getAllToolRoutes,
  getDuplicateRoutes,
  getToolByHref,
  type Tool,
  type ToolStatus,
  type ToolCategory
} from "@/lib/registry";

const VALID_STATUSES: ToolStatus[] = ["Working", "MVP", "Coming Soon"];
const VALID_CATEGORIES: ToolCategory[] = ["validation", "balances", "network"];

describe("tool registry", () => {
  describe("registry data integrity", () => {
    it("should define at least one tool", () => {
      expect(tools.length).toBeGreaterThan(0);
    });

    it("should have unique hrefs for all tools", () => {
      const hrefs = tools.map((tool) => tool.href);
      expect(new Set(hrefs).size).toBe(hrefs.length);
    });

    it("should have a valid status for every tool", () => {
      for (const tool of tools) {
        expect(VALID_STATUSES).toContain(tool.status);
      }
    });

    it("should have a valid category for every tool", () => {
      for (const tool of tools) {
        expect(VALID_CATEGORIES).toContain(tool.category);
      }
    });

    it("should only use registered categories", () => {
      const registeredCategories = Object.keys(toolCategories);
      for (const tool of tools) {
        expect(registeredCategories).toContain(tool.category);
      }
    });
  });

  describe("helper functions", () => {
    it("should return a tool by href", () => {
      const tool = tools[0];
      const found = getToolByHref(tool.href);
      expect(found).toBeDefined();
      expect(found?.title).toBe(tool.title);
    });

    it("should return undefined for an unknown href", () => {
      expect(getToolByHref("/tools/does-not-exist")).toBeUndefined();
    });

    it("should return all routes", () => {
      const routes = getAllToolRoutes();
      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBe(tools.length);
    });

    it("should have unique routes", () => {
      const routes = getAllToolRoutes();
      expect(new Set(routes).size).toBe(routes.length);
    });

    it("should report no duplicate routes", () => {
      expect(getDuplicateRoutes()).toEqual([]);
    });
  });

  it("should document the expected number of tools", () => {
    expect(tools.length).toBe(11);
  });

  it("should have a predefined set of expected tools", () => {
    const expectedTools = [
      "/tools/address-validator",
      "/tools/balance-viewer",
      "/tools/trustline-checker",
      "/tools/payment-qr",
      "/tools/transaction-lookup",
      "/tools/xdr-inspector",
      "/tools/freighter-connect",
      "/tools/testnet-faucet",
      "/tools/asset-metadata",
      "/tools/federation-resolver",
      "/tools/fee-stats"
    ];

    expect(getAllToolRoutes().sort()).toEqual([...expectedTools].sort());
  });

  describe("Tool type integrity", () => {
    it("should have tools that conform to the Tool interface structure", () => {
      const expectedKeys: Array<keyof Tool> = [
        "title",
        "description",
        "character",
        "href",
        "status",
        "category",
        "icon"
      ];

      for (const tool of tools) {
        for (const key of expectedKeys) {
          expect(tool).toHaveProperty(key);
        }
      }
    });
  });
});
