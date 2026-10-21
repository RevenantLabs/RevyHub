import { completedWithdrawal } from "@/features/sep24-transaction-status-tracker/fixtures/completed-withdrawal.fixture";
import { pendingDeposit } from "@/features/sep24-transaction-status-tracker/fixtures/pending-deposit.fixture";

function part(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export function jwt(exp: number): string {
  return `${part({ alg: "none", typ: "JWT" })}.${part({ exp, sub: "GEXAMPLE" })}.sig`;
}

export const homeDomain = "anchor.example";
export const tomlUrl = `https://${homeDomain}/.well-known/stellar.toml`;
export const transferServer = "https://anchor.example/sep24";
export const transactionId = "82fhs729f63dh0v4";
export const liveToken = jwt(4_000_000_000);
export const expiredToken = jwt(1);

export const toml = `TRANSFER_SERVER_SEP0024="${transferServer}"\n`;
export const tomlWithoutServer = `TRANSFER_SERVER="https://anchor.example"\n`;

export { pendingDeposit, completedWithdrawal };
