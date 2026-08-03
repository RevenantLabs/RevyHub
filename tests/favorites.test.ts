import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addFavorite,
  getFavorites,
  isFavorite,
  removeFavorite,
  saveFavorites,
  sortToolsWithFavorites,
  toggleFavorite
} from "@/lib/favorites";
import { tools } from "@/lib/constants";

const STORAGE_KEY = "revyhub-favorites";
const validHref = tools[0].href;

function setStored(value: string) {
  window.localStorage.setItem(STORAGE_KEY, value);
}

describe("favorites", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  describe("getFavorites", () => {
    it("returns an empty array when nothing is stored", () => {
      expect(getFavorites()).toEqual([]);
    });

    it("returns an empty array when stored value is not an array", () => {
      setStored(JSON.stringify({ not: "an array" }));
      expect(getFavorites()).toEqual([]);
    });

    it("returns an empty array when stored value is invalid JSON", () => {
      setStored("{not valid json");
      expect(getFavorites()).toEqual([]);
      expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("ignores non-string entries", () => {
      setStored(JSON.stringify([validHref, 42, null, {}, true]));
      expect(getFavorites()).toEqual([validHref]);
    });

    it("ignores hrefs for tools that no longer exist", () => {
      setStored(JSON.stringify([validHref, "/tools/removed-tool", "/tools/unknown"]));
      expect(getFavorites()).toEqual([validHref]);
    });

    it("removes duplicate hrefs", () => {
      setStored(JSON.stringify([validHref, validHref, validHref]));
      expect(getFavorites()).toEqual([validHref]);
    });
  });

  describe("persistence", () => {
    it("persists favorites and reads them back on reload", () => {
      toggleFavorite(validHref);
      expect(isFavorite(validHref)).toBe(true);

      // Simulate a reload by reading from localStorage again
      expect(getFavorites()).toEqual([validHref]);
      const stored = window.localStorage.getItem(STORAGE_KEY);
      expect(JSON.parse(stored ?? "[]")).toEqual([validHref]);
    });

    it("toggles a favorite off and persists the removal", () => {
      toggleFavorite(validHref);
      toggleFavorite(validHref);
      expect(isFavorite(validHref)).toBe(false);
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe("[]");
    });

    it("does not duplicate when adding an existing favorite", () => {
      addFavorite(validHref);
      addFavorite(validHref);
      expect(getFavorites()).toEqual([validHref]);
    });

    it("removes a favorite and persists the change", () => {
      addFavorite(validHref);
      removeFavorite(validHref);
      expect(getFavorites()).toEqual([]);
    });
  });

  describe("saveFavorites", () => {
    it("filters out invalid hrefs before saving", () => {
      saveFavorites([validHref, "/tools/does-not-exist"]);
      expect(getFavorites()).toEqual([validHref]);
    });

    it("filters out duplicates before saving", () => {
      saveFavorites([validHref, validHref]);
      expect(getFavorites()).toEqual([validHref]);
    });
  });

  describe("sortToolsWithFavorites", () => {
    it("sorts favorited tools to the front", () => {
      const lastHref = tools[tools.length - 1].href;
      addFavorite(lastHref);

      const sorted = sortToolsWithFavorites(tools);
      expect(sorted[0].href).toBe(lastHref);
      expect(new Set(sorted.map((t) => t.href))).toEqual(new Set(tools.map((t) => t.href)));
    });

    it("keeps original order when nothing is favorited", () => {
      const sorted = sortToolsWithFavorites(tools);
      expect(sorted.map((t) => t.href)).toEqual(tools.map((t) => t.href));
    });
  });
});
