import { Keypair, StrKey, xdr } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const contractId = StrKey.encodeContract(Buffer.alloc(32, 1));
export const unknownContractId = StrKey.encodeContract(Buffer.alloc(32, 9));
export const ownerAccountId = seed(2).publicKey();

export const latestLedger = 1_000_000;
export const liveUntilLedgerSeq = 1_000_500;

/**
 * Builds a contract instance XDR with a small instance storage map.
 *
 * The storage contains:
 * - `counter` -> U32(42)
 * - `owner`   -> the deterministic owner account address
 *
 * This is deterministic because every address and hash is derived from a seed.
 *
 * Note: a few XDR union constructors are runtime-valid with a switch argument
 * but the generated TypeScript declarations only accept `never`. We use narrow
 * casts so the runtime behaviour stays correct while type-checking passes.
 */
export function buildContractInstanceXdr(
  contractIdValue: string = contractId,
  storageEntries: { key: string; value: xdr.ScVal }[] = [
    { key: "counter", value: xdr.ScVal.scvU32(42) },
    {
      key: "owner",
      value: xdr.ScVal.scvAddress(
        xdr.ScAddress.scAddressTypeAccount(
          xdr.PublicKey.publicKeyTypeEd25519(seed(2).rawPublicKey())
        )
      )
    }
  ]
): string {
  const hash = StrKey.decodeContract(contractIdValue);
  const scAddress = xdr.ScAddress.scAddressTypeContract(hash);

  const mapEntries = storageEntries.map(({ key, value }) =>
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol(key), val: value })
  );

  const executable = xdr.ContractExecutable.contractExecutableStellarAsset();
  const instance = new xdr.ScContractInstance({
    executable,
    storage: mapEntries
  });

  const ExtensionPointCtor = xdr.ExtensionPoint as unknown as new (
    value: number
  ) => xdr.ExtensionPoint;

  const contractDataEntry = new xdr.ContractDataEntry({
    ext: new ExtensionPointCtor(0),
    contract: scAddress,
    key: xdr.ScVal.scvLedgerKeyContractInstance(),
    durability: xdr.ContractDataDurability.persistent(),
    val: xdr.ScVal.scvContractInstance(instance)
  });

  return xdr.LedgerEntryData.contractData(contractDataEntry).toXDR("base64");
}

/** A realistic `getLedgerEntries` response for the fixture contract. */
export function ledgerEntriesResponse(
  contractIdValue: string = contractId,
  liveUntil: number = liveUntilLedgerSeq
): { entries: { key: string; xdr: string; liveUntilLedgerSeq: number }[]; latestLedger: number } {
  return {
    entries: [
      {
        key: "",
        xdr: buildContractInstanceXdr(contractIdValue),
        liveUntilLedgerSeq: liveUntil
      }
    ],
    latestLedger
  };
}

/** A realistic `getLatestLedger` response. */
export function latestLedgerResponse(sequence: number = latestLedger): { sequence: number } {
  return { sequence };
}
