import { NETWORK_PASSPHRASES } from "@/core/network/config";
import { payee, stranger } from "./sep7RequestPolicyAuditor.fixture";

export const txOperationUri = "web+stellar:tx?xdr=AAAA";
export const malformedUri = "https://example.com/pay";
export const plusMemoUri = `web+stellar:pay?destination=${payee}&amount=2&memo=hello+world&network_passphrase=${encodeURIComponent(NETWORK_PASSPHRASES.testnet)}`;
export const deniedDestinationUri = `web+stellar:pay?destination=${stranger}&amount=2&network_passphrase=${encodeURIComponent(NETWORK_PASSPHRASES.testnet)}`;
export const hugeAmountUri = `web+stellar:pay?destination=${payee}&amount=100&network_passphrase=${encodeURIComponent(NETWORK_PASSPHRASES.testnet)}`;
export const publicNetworkUri = `web+stellar:pay?destination=${payee}&amount=2&network_passphrase=${encodeURIComponent(NETWORK_PASSPHRASES.mainnet)}`;
export const blockedCallbackUri = `web+stellar:pay?destination=${payee}&amount=2&network_passphrase=${encodeURIComponent(NETWORK_PASSPHRASES.testnet)}&callback=${encodeURIComponent("url:https://evil.example/hook")}`;
export const wrongAssetUri = `web+stellar:pay?destination=${payee}&amount=2&asset_code=EURC&asset_issuer=${payee}&network_passphrase=${encodeURIComponent(NETWORK_PASSPHRASES.testnet)}`;
