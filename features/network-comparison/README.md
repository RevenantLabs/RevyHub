# Testnet and Mainnet Comparison

Queries Stellar Testnet and Mainnet Horizon instances concurrently and presents their operational status side by side. It highlights protocol version differences, compares base fee and reserve settings, monitors ingestion health, and explains the operational implications of Testnet's periodic resets.

## How it works

The tool issues parallel requests to Horizon endpoints on both networks:
1. `GET /` — reads the Horizon root document to capture protocol versions, supported core protocols, daemon build versions, and ingestion ledger sequences.
2. `GET /ledgers?order=desc&limit=1` — retrieves the latest closed ledger to inspect the exact ledger sequence, close timestamp, base fee, and base reserve.

Results are displayed in dual comparative columns with an aggregated comparison summary.

## Key architectural decisions

- **Decoupled from the header network switch**: Comparing both networks simultaneously is the primary purpose of this tool. Changing the global network switch in the header does not alter the view.
- **Graceful partial failure**: When one endpoint is unreachable, the surviving network continues to render its data alongside an explicit status indicator in the failing column, rather than aborting the entire screen.
- **Strict integer arithmetic**: All fee and reserve calculations operate strictly on stroop strings and `BigInt` primitives. No floating-point division or arithmetic is performed.
- **No cross-network ledger subtraction**: Ledger heights are recorded and labeled with observation times, but are never subtracted across networks, as Testnet and Mainnet possess distinct genesis blocks and ledger histories.
- **Contextual protocol divergence**: When Testnet is operating on a newer protocol version than Mainnet, an alert surfaces to warn developers that transactions utilizing newer protocol features cannot yet execute on Mainnet.

## Safety

This tool queries public network status endpoints exclusively. It never accepts, stores, transmits, or displays secret keys or private credentials. Any input matching secret key patterns is rejected immediately.
