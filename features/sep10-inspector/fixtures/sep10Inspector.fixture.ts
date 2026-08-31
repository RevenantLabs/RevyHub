import type { Sep10InspectorResult } from "@/features/sep10-inspector/types";
import { Keypair } from "@stellar/stellar-sdk";

const server = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 1));

export const sep10InspectorFixture: Sep10InspectorResult = {
  summary: "SEP-10 challenge structure is valid.",
  valid: true,
  sequence: "1",
  serverSigningAccount: server.publicKey(),
  timeBounds: { minTime: "100", maxTime: "200" },
  operations: [
    { type: "manageData", name: "home_domain", value: "anchor.example" },
    { type: "manageData", name: "web_auth_domain", value: "auth.anchor.example" }
  ],
  rules: [
    { name: "nonzero_sequence", status: "pass", detail: "Sequence is 1." },
    { name: "manage_data_operations", status: "pass", detail: "2 ManageData operations found." }
  ]
};
