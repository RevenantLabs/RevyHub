/** A valid response may expose none or only some quota headers. */
export const missingHeaders = {};
export const partialHeaders = { "X-RateLimit-Limit": "1000" };
export const malformedHeaders = { "X-RateLimit-Remaining": "unknown" };
