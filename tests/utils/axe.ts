import { configureAxe } from "jest-axe";

/**
 * Fails a test only on "serious" or "critical" axe violations. Manual review still
 * covers everything else (moderate/minor issues, screen-reader flow, keyboard traps).
 * jest-axe already disables the color-contrast rule family under jsdom, since jsdom
 * cannot render real layout/paint and would otherwise produce unreliable results.
 */
export const axe = configureAxe({
  impactLevels: ["serious", "critical"]
});
