# Horizon Stream Sampler

Opens Horizon's public transaction SSE endpoint for at most 25 events or 30 seconds. The fetch stream is aborted on the first bound, manual stop, a replacement run or component unmount.

SSE fields are parsed incrementally and each `data` value must be valid JSON. A bound that expires without data is reported as an explicit empty sample. The selected network is attached to each result.

The tool reads public ledger events only. It does not persist subscriptions, filter private account data, sign transactions or accept secret keys.
