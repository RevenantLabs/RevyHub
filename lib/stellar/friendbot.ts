import { validatePublicKey } from "@/lib/stellar/validateAddress";

export interface FriendbotSuccess {
  ok: true;
  hash: string;
  ledger: number;
  envelopeXdr: string;
  resultXdr: string;
  resultMetaXdr: string;
}

export interface FriendbotError {
  ok: false;
  code: "INVALID_ADDRESS" | "ALREADY_FUNDED" | "RATE_LIMITED" | "NETWORK_ERROR" | "UNKNOWN";
  message: string;
  detail?: string;
}

export type FriendbotResult = FriendbotSuccess | FriendbotError;

export async function fundTestnetAccount(publicKey: string): Promise<FriendbotResult> {
  const validation = validatePublicKey(publicKey);

  if (!validation.valid) {
    return {
      ok: false,
      code: "INVALID_ADDRESS",
      message: validation.message
    };
  }

  try {
    const url = `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey.trim())}`;
    const response = await fetch(url);
    const body = await response.json();

    if (response.ok) {
      return {
        ok: true,
        hash: body.hash ?? body.transaction_hash ?? "",
        ledger: body.ledger ?? 0,
        envelopeXdr: body.envelope_xdr ?? body.result_xdr ?? "",
        resultXdr: body.result_xdr ?? "",
        resultMetaXdr: body.result_meta_xdr ?? ""
      };
    }

    // Friendbot returns specific status codes and detail for known error cases.
    if (response.status === 400) {
      const detail = body?.detail ?? body?.title ?? "";
      if (detail.toLowerCase().includes("already") || detail.toLowerCase().includes("funded") || detail.toLowerCase().includes("create")) {
        return {
          ok: false,
          code: "ALREADY_FUNDED",
          message: "The faucet says this account already has funds.",
          detail: "Testnet accounts can only be funded once by Friendbot. Try a fresh keypair or check the balance viewer."
        };
      }
      if (detail.toLowerCase().includes("rate") || detail.toLowerCase().includes("limit")) {
        return {
          ok: false,
          code: "RATE_LIMITED",
          message: "The faucet helper is pouring too fast.",
          detail: "Friendbot limits how often you can request testnet XLM. Wait a moment and try again."
        };
      }
      return {
        ok: false,
        code: "UNKNOWN",
        message: "Friendbot could not fund this account.",
        detail: detail || "The faucet helper ran into an unexpected problem."
      };
    }

    if (response.status === 429) {
      return {
        ok: false,
        code: "RATE_LIMITED",
        message: "The faucet helper is pouring too fast.",
        detail: "Friendbot limits how often you can request testnet XLM. Wait a moment and try again."
      };
    }

    return {
      ok: false,
      code: "UNKNOWN",
      message: "Friendbot could not fund this account.",
      detail: `Unexpected response (${response.status}). The faucet helper may be temporarily unavailable.`
    };
  } catch {
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: "The faucet helper could not reach Friendbot.",
      detail: "Check your network connection. Friendbot may be temporarily down."
    };
  }
}
