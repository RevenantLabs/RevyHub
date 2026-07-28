import { validatePublicKey } from "@/lib/stellar/validateAddress";

const FRIENDBOT_URL = process.env.NEXT_PUBLIC_FRIENDBOT_URL ?? "https://friendbot.stellar.org";

export async function fundTestnetAccount(publicKey: string) {
  // TODO(issue #13): Return typed Friendbot success/error states, including rate-limit and already-funded hints.
  const validation = validatePublicKey(publicKey);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const url = new URL(FRIENDBOT_URL);
  url.searchParams.set("addr", publicKey.trim());
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Friendbot could not fund this account. It may already be funded or rate limited.");
  }

  return response.json();
}
