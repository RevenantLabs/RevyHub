import { hash } from "@stellar/stellar-sdk";
import { NETWORK_PASSPHRASES } from "@/core/network/config";
import type { StellarNetwork } from "@/core/network/types";

/** Stellar's network ID is SHA-256 of the UTF-8 network passphrase. */
export function networkId(network: StellarNetwork): Buffer {
  return hash(Buffer.from(NETWORK_PASSPHRASES[network], "utf8"));
}
