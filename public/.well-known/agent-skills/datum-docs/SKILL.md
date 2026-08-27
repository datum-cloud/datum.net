# Datum Documentation Search

**Skill ID:** datum-docs-search  
**Type:** skill-md  
**Version:** 1.0.0

## Description

Search and retrieve information from Datum's documentation covering network cloud configuration, API usage, platform features, and developer guides.

## Usage

Navigate to `https://www.datum.net/docs/` to browse documentation, or append `?q={query}` to search.

## Key Resources

- **Developer resources index:** https://www.datum.net/developers — every resource below, named and linked in one place.
- **Overview:** https://www.datum.net/docs/overview
- **Quickstart:** https://www.datum.net/docs/datumctl/quickstart
- **API Reference (this site's own endpoints):** https://www.datum.net/openapi.json (also https://www.datum.net/api/openapi.yaml) — versioned at `/api/v1/`
- **Platform API discovery:** https://api.datum.net/openapi/v3 (Kubernetes-native OpenAPI v3; requires an authenticated bearer token) — for a human-readable path into the same resource types, see https://www.datum.net/docs/datumctl/discovering-resources
- **datumctl CLI:** https://www.datum.net/docs/datumctl/overview
- **MCP server:** https://www.datum.net/mcp/server-card — manages Datum Cloud infrastructure (stdio transport today)
- **Application Load Balancer:** https://www.datum.net/docs/alb/overview

## Authentication

Public documentation requires no authentication. API access requires an account at https://auth.datum.net.

## Related

- API Catalog: https://www.datum.net/.well-known/api-catalog
- AI Catalog: https://www.datum.net/.well-known/ai-catalog.json
- MCP Server Card: https://www.datum.net/.well-known/mcp/server-card.json (also https://www.datum.net/server.json)
