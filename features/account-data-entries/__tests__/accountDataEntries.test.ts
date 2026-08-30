import { describe, expect, it } from "vitest";
import { fetchAccountDataEntries } from "../lib/accountDataEntries";
import { withMswHandlers, http, HttpResponse } from "@/core/testing/msw";

const server = withMswHandlers();

describe("fetchAccountDataEntries", () => {
  const url = "https://horizon-testnet.stellar.org";

  it("returns account_not_found for 404", async () => {
    server.use(http.get(`${url}/accounts/G123`, () => new HttpResponse(null, { status: 404 })));
    const res = await fetchAccountDataEntries("G123", url);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("account_not_found");
  });

  it("returns request_failed for 500", async () => {
    server.use(http.get(`${url}/accounts/G123`, () => new HttpResponse(null, { status: 500 })));
    const res = await fetchAccountDataEntries("G123", url);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("request_failed");
  });

  it("returns entries on success", async () => {
    const b64 = Buffer.from("hello").toString("base64");
    server.use(http.get(`${url}/accounts/G123`, () => HttpResponse.json({
      data: { "key1": b64 }
    })));
    const res = await fetchAccountDataEntries("G123", url);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.entries).toHaveLength(1);
      expect(res.value.entries[0].key).toBe("key1");
      expect(res.value.entries[0].decodedValue).toBe("hello");
    }
  });

  it("handles account with no data entries", async () => {
    server.use(http.get(`${url}/accounts/G123`, () => HttpResponse.json({ data: {} })));
    const res = await fetchAccountDataEntries("G123", url);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.entries).toHaveLength(0);
  });
});
