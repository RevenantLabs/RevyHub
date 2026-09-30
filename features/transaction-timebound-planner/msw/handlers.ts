import { http, HttpResponse } from "msw";

/** Request mocks used by this slice's tests. Keep responses realistic. */
export const handlers = [
  http.get("https://horizon-testnet.stellar.org/*", () => HttpResponse.json({}))
];
