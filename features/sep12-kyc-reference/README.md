# SEP-12 KYC Field Reference

A searchable reference for SEP-12 (Stellar KYC protocol) field types, their descriptions, data requirements, and validation rules.

## What it does

- **Browse**: View all SEP-12 KYC fields organized by category (Personal, Entity, Organization)
- **Search**: Find fields by name, type, or description
- **Filter**: Narrow results by category

## Design decisions

- **Fully offline**: No network requests. All KYC field data is embedded.
- **Categories**: Fields are organized into Personal, Entity, and Organization categories.
- **Search**: Matches against field name, description, and type simultaneously.

## Error handling

- Empty query → returns all fields (browse mode)
- No matching results → shows empty state with guidance
- Invalid filter → returns error with recovery suggestion

## Data source

Based on SEP-12 (Stellar Ecosystem Proposal) field definitions.
