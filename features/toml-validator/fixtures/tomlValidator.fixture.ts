import type { TomlValidatorResult } from "@/features/toml-validator/types";
import { Keypair } from "@stellar/stellar-sdk";

const account = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 4)).publicKey();

export const tomlValidatorFixture: TomlValidatorResult = {
  summary: "stellar.toml passed the available SEP-1 checks.",
  source: "pasted",
  checks: [
    { field: "ORG_NAME", status: "pass", detail: "ORG_NAME is present." },
    { field: "ORG_URL", status: "pass", detail: "ORG_URL is present." }
  ],
  currencies: [{ code: "USDC", issuer: account, codeValid: true, issuerValid: true }],
  warnings: [],
  errors: [],
  cors: { status: "not_checked", detail: "CORS is not applicable to pasted TOML." }
};
