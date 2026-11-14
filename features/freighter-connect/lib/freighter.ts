import { err, ok, type Result } from "@/core/result/result";
import { readFreighterApi } from "@/features/freighter-connect/schema";
import { normalizeWalletNetwork } from "@/features/freighter-connect/lib/freighter.errors";
import type {
  FreighterErrorCode,
  WalletSnapshot
} from "@/features/freighter-connect/types";

const CONNECTION_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms = CONNECTION_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error("TIMEOUT")), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

/**
 * Reads the wallet's current state.
 *
 * `isAllowed` returning false is not an error: the extension is installed and
 * working, the user simply has not granted this site access yet. That is a
 * state the UI can act on, so it is reported as a successful snapshot.
 */
export async function readWallet(
  target?: unknown
): Promise<Result<WalletSnapshot, FreighterErrorCode>> {
  const api = readFreighterApi(target);
  if (!api.ok) return api;

  try {
    const allowed = (await withTimeout(api.value.isAllowed?.() ?? Promise.resolve(false))) ?? false;

    if (!allowed) {
      return ok({ installed: true, allowed: false, network: "unknown" });
    }

    const [publicKey, rawNetwork] = await Promise.all([
      withTimeout(api.value.getPublicKey!()),
      withTimeout(api.value.getNetwork!())
    ]);

    return ok({
      installed: true,
      allowed: true,
      publicKey,
      rawNetwork,
      network: normalizeWalletNetwork(rawNetwork)
    });
  } catch {
    return err("read_failed");
  }
}

/** Asks the extension for permission, then reads the wallet again. */
export async function requestAccess(
  target?: unknown
): Promise<Result<WalletSnapshot, FreighterErrorCode>> {
  const api = readFreighterApi(target);
  if (!api.ok) return api;

  try {
    await withTimeout(api.value.setAllowed?.() ?? Promise.resolve(false));
  } catch {
    return err("not_allowed");
  }

  return readWallet(target);
}
