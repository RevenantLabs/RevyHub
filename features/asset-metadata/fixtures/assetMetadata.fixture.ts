import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const issuerA = seed(1).publicKey();
export const issuerB = seed(2).publicKey();

export const DOMAIN = "example.com";
export const ORIGIN = `https://${DOMAIN}`;
export const TOML_URL = `${ORIGIN}/.well-known/stellar.toml`;

export const tomlWithTwoCurrencies = `
VERSION="2.0.0"
NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"

[[CURRENCIES]]
code = "USDC"
issuer = "${issuerA}"
name = "USD Coin"
desc = "A dollar-denominated stablecoin."
image = "https://example.com/usdc.png"

[[CURRENCIES]]
code = "EURC"
issuer = "${issuerB}"
name = 'Euro Coin'
home_domain = example.com

[DOCUMENTATION]
ORG_NAME = "Example Anchor"
`;

/** An entry with no issuer — it names an asset but pins it to nobody. */
export const tomlWithUnpinnedCurrency = `
[[CURRENCIES]]
code = "MYSTERY"
name = "Unpinned asset"
`;

export const tomlWithoutCurrencies = `VERSION="2.0.0"\n[DOCUMENTATION]\nORG_NAME="Example"\n`;

/** A line with no "=" is not parseable TOML. */
export const malformedToml = `[[CURRENCIES]]\ncode "USDC"\n`;

/** Comments and blank lines must not break the parser. */
export const tomlWithComments = `
# leading comment
[[CURRENCIES]]
# the asset code
code = "USDC"   # trailing comment
issuer = "${issuerA}"

`;
