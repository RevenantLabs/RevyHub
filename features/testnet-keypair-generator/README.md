# Testnet Keypair Generator

Generate Stellar testnet keypairs, derive addresses from seeds, and validate key formats.

## What it does

- **Generate**: Create new testnet keypairs (public key + seed)
- **Derive**: Extract public key from an existing seed
- **Validate**: Check if a key is a valid public key (G...) or seed (S...)

## Design decisions

- **Fully offline**: No network requests. All operations use @stellar/stellar-sdk.
- **Testnet only**: Generates keypairs for testnet by default.
- **Security note**: Seeds are displayed but users are warned never to share them.

## Error handling

- Invalid seed → specific error message
- Invalid public key → validation error
