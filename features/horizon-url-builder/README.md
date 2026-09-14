# Horizon URL Builder

Construct Horizon REST API URLs with proper query parameters, cursors, and filters.

## What it does

- Select a Horizon REST API resource (accounts, transactions, operations, etc.)
- Choose network (mainnet/testnet)
- Configure cursor, limit, and order parameters
- Copy the built URL

## Design decisions

- **Fully offline**: No network requests. All URL construction is local.
- **Parameter validation**: Limit is clamped to 1-200, order must be asc/desc.
- **All resources**: Supports all 9 Horizon REST API resources.

## Error handling

- Invalid resource → specific error
- Invalid network → specific error
