export const firstPageTokens = Array.from({ length: 20 }, (_, index) => String(100 - index));
export const secondPageTokens = ["81", "80", "79"];
export const firstPageCursor = firstPageTokens.at(-1)!;
export const stalledPageTokens = Array.from({ length: 20 }, () => firstPageCursor);
