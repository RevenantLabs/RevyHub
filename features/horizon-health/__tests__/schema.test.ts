import { expect, it } from "vitest";
import { isHorizonRoot, parseHorizonHealthInput } from "../schema";
import { horizonHealthFixture as root } from "../fixtures/horizonHealth.fixture";
it("accepts only the configured inspection action", () => expect(parseHorizonHealthInput()).toEqual({ok: true, value: {inspect: true}}));
it("validates uint32 ledger fields and history ordering", () => {
 expect(isHorizonRoot(root)).toBe(true);
 for (const n of [-1, 0.5, 4294967296, "1000", null]) expect(isHorizonRoot({...root, core_latest_ledger: n})).toBe(false);
 expect(isHorizonRoot({...root, core_latest_ledger: 4294967295})).toBe(true);
 expect(isHorizonRoot({...root, history_elder_ledger: 999})).toBe(false);
 expect(isHorizonRoot({})).toBe(false);
 expect(isHorizonRoot(null)).toBe(false);
});
