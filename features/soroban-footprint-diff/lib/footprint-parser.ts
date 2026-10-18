import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  AccessMode,
  FootprintKey,
  ParsedFootprint,
  ResourceSummaryData,
  SorobanFootprintDiffErrorCode
} from "@/features/soroban-footprint-diff/types";

const BASE64_XDR = /^[A-Za-z0-9+/=]+$/;

function emptyResources(): ResourceSummaryData {
  return {
    minResourceFee: null,
    cpuInsns: null,
    memBytes: null,
    labeledAsSimulation: true
  };
}

function summarizeLedgerKey(key: xdr.LedgerKey): string {
  const kind = key.switch().name;
  try {
    switch (kind) {
      case "account":
        return `account:${key.account().accountId().ed25519().toString("hex").slice(0, 8)}`;
      case "contractData": {
        const address = key.contractData().contract();
        const bytes =
          address.switch().name === "scAddressTypeContract"
            ? address.contractId()
            : address.accountId().ed25519();
        return `contractData:${bytes.toString("hex").slice(0, 12)}`;
      }
      case "contractCode":
        return `contractCode:${key.contractCode().hash().toString("hex").slice(0, 12)}`;
      default:
        return kind;
    }
  } catch {
    return kind;
  }
}

function decodeKeyEntry(
  entry: unknown,
  mode: Exclude<AccessMode, "conflict">
): Result<FootprintKey, SorobanFootprintDiffErrorCode> {
  if (typeof entry === "string") {
    const value = entry.trim();
    if (!value) return err("invalid_footprint_xdr");

    // Opaque fixture / already-decoded labels stay as-is.
    if (!BASE64_XDR.test(value) || value.length < 16 || value.includes(":")) {
      return ok({ id: value, label: value, mode });
    }

    try {
      const key = xdr.LedgerKey.fromXDR(value, "base64");
      const label = summarizeLedgerKey(key);
      return ok({ id: value, label, mode });
    } catch {
      return err("invalid_footprint_xdr");
    }
  }

  if (entry && typeof entry === "object") {
    const record = entry as { xdr?: unknown; key?: unknown; id?: unknown; label?: unknown };
    if (typeof record.xdr === "string") return decodeKeyEntry(record.xdr, mode);
    if (typeof record.key === "string") return decodeKeyEntry(record.key, mode);
    if (typeof record.id === "string") {
      const label = typeof record.label === "string" ? record.label : record.id;
      return ok({ id: record.id, label, mode });
    }
  }

  return err("invalid_footprint_xdr");
}

function mergeModes(existing: AccessMode, next: AccessMode): AccessMode {
  if (existing === next) return existing;
  return "conflict";
}

export function parseSimulationFootprint(
  raw: string
): Result<ParsedFootprint, SorobanFootprintDiffErrorCode> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return err("invalid_json");
  }

  if (!parsed || typeof parsed !== "object") return err("invalid_json");
  const document = parsed as {
    footprint?: { readOnly?: unknown; readWrite?: unknown };
    minResourceFee?: unknown;
    cost?: { cpuInsns?: unknown; memBytes?: unknown };
  };

  if (!document.footprint || typeof document.footprint !== "object") {
    return err("invalid_json");
  }

  const readOnly = document.footprint.readOnly;
  const readWrite = document.footprint.readWrite;
  if (!Array.isArray(readOnly) || !Array.isArray(readWrite)) {
    return err("invalid_json");
  }

  const byId = new Map<string, FootprintKey>();

  for (const entry of readOnly) {
    const decoded = decodeKeyEntry(entry, "read_only");
    if (!decoded.ok) return decoded;
    const previous = byId.get(decoded.value.id);
    byId.set(
      decoded.value.id,
      previous
        ? { ...decoded.value, mode: mergeModes(previous.mode, "read_only") }
        : decoded.value
    );
  }

  for (const entry of readWrite) {
    const decoded = decodeKeyEntry(entry, "read_write");
    if (!decoded.ok) return decoded;
    const previous = byId.get(decoded.value.id);
    byId.set(
      decoded.value.id,
      previous
        ? { ...decoded.value, mode: mergeModes(previous.mode, "read_write") }
        : decoded.value
    );
  }

  const resources = emptyResources();
  if (typeof document.minResourceFee === "string") {
    resources.minResourceFee = document.minResourceFee;
  }
  if (document.cost && typeof document.cost === "object") {
    if (typeof document.cost.cpuInsns === "string") resources.cpuInsns = document.cost.cpuInsns;
    if (typeof document.cost.memBytes === "string") resources.memBytes = document.cost.memBytes;
  }

  return ok({ keys: [...byId.values()], resources });
}
