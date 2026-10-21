import { describe, expect, it } from "vitest";
import { readTransferServer } from "@/features/sep24-transaction-status-tracker/lib/transfer-server-resolve";
import {
  toml,
  tomlWithoutServer,
  transferServer
} from "@/features/sep24-transaction-status-tracker/fixtures/sep24TransactionStatusTracker.fixture";

describe("readTransferServer", () => {
  it("reads an https TRANSFER_SERVER_SEP0024", () => {
    expect(readTransferServer(toml)).toEqual({ ok: true, value: transferServer });
  });

  it("reports an anchor that does not publish SEP-24", () => {
    expect(readTransferServer(tomlWithoutServer)).toEqual({ ok: false, code: "missing_transfer_server" });
  });

  it("rejects a non-https transfer server", () => {
    expect(readTransferServer('TRANSFER_SERVER_SEP0024="http://anchor.example/sep24"\n')).toEqual({
      ok: false,
      code: "request_failed"
    });
  });
});
