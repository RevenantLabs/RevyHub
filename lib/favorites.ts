/**
 * Favorites Management
 *
 * Handles localStorage persistence for pinned/favorite tools.
 * Provides safe fallbacks for SSR and handles invalid stored data.
 */

import { tools, type Tool } from "@/lib/constants";

const STORAGE_KEY = "revyhub-favorites";

/**
 * Gets the list of favorite tool hrefs from localStorage.
 * Safely handles SSR (returns empty array) and invalid stored data.
 */
export function getFavorites(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    // Filter out any invalid or non-existent tool hrefs
    const validHrefs = new Set(tools.map((t) => t.href));
    const favorites = parsed.filter(
      (href): href is string => typeof href === "string" && validHrefs.has(href)
    );

    // Remove duplicates
    return Array.from(new Set(favorites));
  } catch {
    // If parsing fails, clear invalid data and return empty
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

/**
 * Saves the list of favorite tool hrefs to localStorage.
 */
export function saveFavorites(favorites: string[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Ensure only valid hrefs are saved
    const validHrefs = new Set(tools.map((t) => t.href));
    const validFavorites = favorites.filter((href) => validHrefs.has(href));
    const uniqueFavorites = Array.from(new Set(validFavorites));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueFavorites));
  } catch {
    // Silently fail on storage errors (e.g., quota exceeded)
    console.warn("Failed to save favorites to localStorage");
  }
}

/**
 * Adds a tool to favorites.
 */
export function addFavorite(href: string): string[] {
  const favorites = getFavorites();
  if (!favorites.includes(href)) {
    const newFavorites = [...favorites, href];
    saveFavorites(newFavorites);
    return newFavorites;
  }
  return favorites;
}

/**
 * Removes a tool from favorites.
 */
export function removeFavorite(href: string): string[] {
  const favorites = getFavorites();
  const newFavorites = favorites.filter((f) => f !== href);
  saveFavorites(newFavorites);
  return newFavorites;
}

/**
 * Toggles a tool's favorite status.
 * Returns the new list of favorites.
 */
export function toggleFavorite(href: string): string[] {
  const favorites = getFavorites();
  if (favorites.includes(href)) {
    return removeFavorite(href);
  }
  return addFavorite(href);
}

/**
 * Checks if a tool is in favorites.
 */
export function isFavorite(href: string): boolean {
  return getFavorites().includes(href);
}

/**
 * Gets favorite tools sorted to appear first.
 * Non-favorite tools follow in their original order.
 */
export function sortToolsWithFavorites(toolList: Tool[]): Tool[] {
  const favorites = new Set(getFavorites());
  const favoriteTools: Tool[] = [];
  const otherTools: Tool[] = [];

  for (const tool of toolList) {
    if (favorites.has(tool.href)) {
      favoriteTools.push(tool);
    } else {
      otherTools.push(tool);
    }
  }

  return [...favoriteTools, ...otherTools];
}
