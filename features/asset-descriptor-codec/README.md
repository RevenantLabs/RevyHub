# Classic Asset Descriptor and XDR Codec

Converts native and issued Stellar asset descriptors to canonical text, structured JSON, and Asset XDR — and decodes Asset XDR back into the same representations.

## What it does

- **Encode**: Enter `XLM` or `CODE:ISSUER` → get canonical text, JSON, and base64 XDR
- **Decode**: Paste a base64 Asset XDR → get all three representations

## Design decisions

- **Fully offline**: No network requests. The manifest sets `networks: []` and `offline: true`. MSW exports an empty handler array.
- **Input auto-detection**: The schema detects XDR by length (>20 chars) and absence of colons. No mode toggle needed.
- **Roundtrip fidelity**: Encoding then decoding produces the same canonical representation, verified in tests.

## Error handling

- Empty input → `empty_input`
- Invalid asset code (>12 chars, non-alphanumeric) → `invalid_asset_code`
- Invalid issuer (not a valid Ed25519 address) → `invalid_issuer`
- Invalid XDR (cannot decode) → `invalid_xdr`
