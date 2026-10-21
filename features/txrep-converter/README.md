# SEP-0011 Txrep Converter

Converts a pasted transaction envelope between base64 XDR and SEP-0011 Txrep without leaving the browser. The input is detected automatically: a base64 token is XDR, and `field: value` lines are Txrep.

XDR is decoded with the Stellar SDK and written with SEP-0011 key paths, including `._present`, `.len`, and union discriminants. Versioned `TransactionV0Envelope` and `TransactionV1Envelope` arms are inlined, so a v1 envelope starts at `tx.` and `signatures.` rather than `v1.tx.`. Accounts, signers, and assets use their strkey and `CODE:ISSUER` forms.

Txrep is compiled back into an envelope. A missing `type` line, a bad enum, or a value of the wrong type is `invalid_txrep`. Missing optional fields follow the SEP-0011 defaults. After either direction, the tool converts the result back and compares the envelope bytes. If they differ, the converted text is hidden and a round-trip warning is shown.

Secret seeds are rejected before conversion. Nothing is signed or submitted. Inputs longer than 64 KiB are rejected.
