import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  getRecentTools,
  recordToolUse,
  clearRecentTools,
  validateRecentToolsStorage
} from "../../lib/recentlyUsedTools";
import { mockStorage, localStorageMock } from "../setup";

describe("recentlyUsedTools", () => {
  beforeEach(() => {
    // Clear mock storage
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    vi.clearAllMocks();
  });

  describe("getRecentTools", () => {
    it("returns empty array when no storage exists", () => {
      const result = getRecentTools();
      expect(result).toEqual([]);
    });

    it("returns empty array for malformed JSON", () => {
      mockStorage["revyhub_recent_tools"] = "not valid json";
      const result = getRecentTools();
      expect(result).toEqual([]);
    });

    it("returns empty array for non-array JSON", () => {
      mockStorage["revyhub_recent_tools"] = '{"routeId": "/tools/test"}';
      const result = getRecentTools();
      expect(result).toEqual([]);
    });

    it("filters out entries without routeId or timestamp", () => {
      mockStorage["revyhub_recent_tools"] = JSON.stringify([
        { routeId: "/tools/test", timestamp: "2024-01-01T00:00:00Z" },
        { routeId: "/tools/other" },
        { timestamp: "2024-01-01T00:00:00Z" },
        {}
      ]);
      const result = getRecentTools();
      expect(result).toHaveLength(1);
      expect(result[0].routeId).toBe("/tools/test");
    });

    it("sorts entries by timestamp descending (most recent first)", () => {
      mockStorage["revyhub_recent_tools"] = JSON.stringify([
        { routeId: "/tools/old", timestamp: "2024-01-01T00:00:00Z" },
        { routeId: "/tools/new", timestamp: "2024-01-03T00:00:00Z" },
        { routeId: "/tools/middle", timestamp: "2024-01-02T00:00:00Z" }
      ]);
      const result = getRecentTools();
      expect(result[0].routeId).toBe("/tools/new");
      expect(result[1].routeId).toBe("/tools/middle");
      expect(result[2].routeId).toBe("/tools/old");
    });
  });

  describe("recordToolUse", () => {
    it("creates a new entry with routeId and timestamp", () => {
      recordToolUse("/tools/address-validator");

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "revyhub_recent_tools",
        expect.any(String)
      );

      const stored = JSON.parse(mockStorage["revyhub_recent_tools"]!);
      expect(stored).toHaveLength(1);
      expect(stored[0].routeId).toBe("/tools/address-validator");
      expect(stored[0].timestamp).toBeDefined();
    });

    it("moves existing tool to top when recorded again", () => {
      mockStorage["revyhub_recent_tools"] = JSON.stringify([
        { routeId: "/tools/old", timestamp: "2024-01-01T00:00:00Z" },
        { routeId: "/tools/address-validator", timestamp: "2024-01-01T00:00:00Z" }
      ]);

      const originalTimestamp = "2024-01-01T00:00:00Z";
      recordToolUse("/tools/address-validator");

      const stored = JSON.parse(mockStorage["revyhub_recent_tools"]!);
      expect(stored).toHaveLength(2);
      expect(stored[0].routeId).toBe("/tools/address-validator");
      expect(stored[0].timestamp).not.toBe(originalTimestamp);
      expect(stored[1].routeId).toBe("/tools/old");
    });

    it("does not store duplicate entries", () => {
      recordToolUse("/tools/address-validator");
      recordToolUse("/tools/balance-viewer");
      recordToolUse("/tools/address-validator");

      const stored = JSON.parse(mockStorage["revyhub_recent_tools"]!);
      const addressValidatorCount = stored.filter(
        (e: { routeId: string }) => e.routeId === "/tools/address-validator"
      ).length;
      expect(addressValidatorCount).toBe(1);
    });

    it("limits storage to MAX_RECENT_TOOLS entries", () => {
      // Record 6 tools (more than MAX_RECENT_TOOLS which is 5)
      recordToolUse("/tools/tool1");
      recordToolUse("/tools/tool2");
      recordToolUse("/tools/tool3");
      recordToolUse("/tools/tool4");
      recordToolUse("/tools/tool5");
      recordToolUse("/tools/tool6");

      const stored = JSON.parse(mockStorage["revyhub_recent_tools"]!);
      expect(stored).toHaveLength(5);
      expect(stored[0].routeId).toBe("/tools/tool6");
      expect(stored[4].routeId).toBe("/tools/tool2");
    });
  });

  describe("clearRecentTools", () => {
    it("removes the storage key", () => {
      mockStorage["revyhub_recent_tools"] = JSON.stringify([
        { routeId: "/tools/test", timestamp: "2024-01-01T00:00:00Z" }
      ]);

      clearRecentTools();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("revyhub_recent_tools");
    });

    it("does not throw when storage is already empty", () => {
      expect(() => clearRecentTools()).not.toThrow();
    });
  });

  describe("validateRecentToolsStorage", () => {
    it("returns true when storage is empty", () => {
      const result = validateRecentToolsStorage();
      expect(result).toBe(true);
    });

    it("returns true for valid storage", () => {
      mockStorage["revyhub_recent_tools"] = JSON.stringify([
        { routeId: "/tools/test", timestamp: "2024-01-01T00:00:00Z" }
      ]);
      const result = validateRecentToolsStorage();
      expect(result).toBe(true);
    });

    it("returns false when entries contain unexpected keys", () => {
      mockStorage["revyhub_recent_tools"] = JSON.stringify([
        {
          routeId: "/tools/test",
          timestamp: "2024-01-01T00:00:00Z",
          accountAddress: "GABC123" // This should NOT be stored
        }
      ]);
      const result = validateRecentToolsStorage();
      expect(result).toBe(false);
    });

    it("returns false for entries with extra string keys", () => {
      mockStorage["revyhub_recent_tools"] = JSON.stringify([
        { routeId: "/tools/test", timestamp: "2024-01-01T00:00:00Z", secret: "S123" }
      ]);
      const result = validateRecentToolsStorage();
      expect(result).toBe(false);
    });

    it("returns true for empty array", () => {
      mockStorage["revyhub_recent_tools"] = "[]";
      const result = validateRecentToolsStorage();
      expect(result).toBe(true);
    });
  });
});
