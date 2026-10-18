import type { RawBalance } from "../lib/claimant-pages";
import { beforeBalance } from "./claimableBalanceDeadlineBoard.fixture";
export const fullPage: RawBalance[] = Array.from({ length: 200 }, (_, index) => ({
  ...beforeBalance, id: index.toString(16).padStart(64, "0"), paging_token: String(index + 1)
}));
export const secondPage: RawBalance[] = [
  fullPage[199],
  { ...beforeBalance, id: "c".repeat(64), paging_token: "201" }
];
