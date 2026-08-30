import { Keypair } from "@stellar/stellar-sdk";

export const mockAccount = Keypair.random().publicKey();
