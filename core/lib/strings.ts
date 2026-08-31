export function truncateMiddle(value: string, visible = 6): string {
  if (value.length <= visible * 2 + 3) return value;
  return `${value.slice(0, visible)}...${value.slice(-visible)}`;
}

export function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

/** Collapses whitespace and trims — used before validating pasted input. */
export function normalizeInput(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
