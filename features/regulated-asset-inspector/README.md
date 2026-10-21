# SEP-8 Regulated Asset Inspector

Reads an issuer account on the selected Horizon network, follows its `home_domain`, and matches one `[[CURRENCIES]]` entry in `https://{home_domain}/.well-known/stellar.toml`.

A present `regulated = true` field is shown as regulated, together with `approval_server` and `approval_criteria` when the issuer published them. A currency that omits `regulated` is explicitly **not regulated**. A toml that cannot be fetched is `toml_unreachable`, never a not-regulated claim.

Horizon account flags (`auth_required`, `auth_revocable`, and the rest) are displayed beside the declaration and are not inferred from it. Every displayed field is labeled as self-published by the issuer.

Secret seeds are rejected before any request.
