import { Keypair } from "@stellar/stellar-sdk";
import type { Sep38QuoteViewerRawInput } from "@/features/sep38-quote-viewer/types";

const issuerKey = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9));

export const issuer = issuerKey.publicKey();
export const secretSeed = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 4)).secret();

export const HOME_DOMAIN = "quote.example";
export const TOML_URL = `https://${HOME_DOMAIN}/.well-known/stellar.toml`;
export const QUOTE_SERVER = "https://quote.example/sep38";
export const OFF_CHAIN_ASSET = "iso4217:USD";
export const ON_CHAIN_ASSET = `stellar:USDC:${issuer}`;
export const SELL_AMOUNT = "100.50";
export const INDICATIVE_PRICE = "1.2500000";
export const BUY_AMOUNT = "125.6250000";
export const EXPIRES_AT = "2026-06-01T15:04:05Z";
export const FEE_TOTAL = "0.30";

export const normalRaw: Sep38QuoteViewerRawInput = {
  homeDomain: HOME_DOMAIN,
  offChainAsset: OFF_CHAIN_ASSET,
  onChainAsset: ON_CHAIN_ASSET,
  sellSide: "off-chain",
  sellAmount: SELL_AMOUNT
};

export const tomlDocument = [
  `SIGNING_KEY="${issuer}"`,
  `ANCHOR_QUOTE_SERVER="${QUOTE_SERVER}"`,
  "NETWORK_PASSPHRASE=\"Test SDF Network ; September 2015\""
].join("\n");

export const tomlSingleQuoted = `ANCHOR_QUOTE_SERVER='${QUOTE_SERVER}'`;
export const tomlBare = `ANCHOR_QUOTE_SERVER=${QUOTE_SERVER}`;
export const tomlCommentedOnly = `# ANCHOR_QUOTE_SERVER="${QUOTE_SERVER}"\nNETWORK_PASSPHRASE="test"`;
export const tomlMissingQuoteServer = `SIGNING_KEY="${issuer}"\nTRANSFER_SERVER="https://quote.example/sep6"`;
export const tomlHttpQuoteServer = 'ANCHOR_QUOTE_SERVER="http://quote.example/sep38"';
export const tomlBrokenQuoteServer = 'ANCHOR_QUOTE_SERVER="not a url"';

export const priceBody = {
  price: INDICATIVE_PRICE,
  sell_amount: SELL_AMOUNT,
  buy_amount: BUY_AMOUNT,
  expires_at: EXPIRES_AT,
  fee: { total: FEE_TOTAL, asset: OFF_CHAIN_ASSET }
};
