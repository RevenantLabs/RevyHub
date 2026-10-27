# Path Payment Slippage Calculator

Loads the operations for one settled transaction and audits its path payment against the bound committed in the operation.

Strict-send compares actual destination amount with the minimum destination bound. Strict-receive compares actual source amount with the maximum send bound. Decimal amounts are converted to seven-decimal integer units and the percentage is computed as basis points with `BigInt`; floating point is never used.

The selected network is part of the result. The tool only reads public Horizon data, never signs or submits transactions and never accepts a secret key.
