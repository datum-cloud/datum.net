---
title: "Overview"
sidebar:
  order: 5
---

`datumctl` is the command-line interface for interacting with Datum Cloud. It is
built using Go and the [Cobra](https://cobra.dev/) library for CLI structure.

## Design goals

*   **Secure Authentication:** Prioritize secure, modern authentication flows
    (OIDC/PKCE) over static credentials.
*   **Usability:** Provide a clear and consistent command structure.
*   **Extensibility:** Allow for easy addition of new commands and resource
    types.
*   **Integration:** Serve as a reliable component for other tools,
    particularly `kubectl` via exec plugins.

## Key components

*   **Authentication (`internal/cmd/auth`, `internal/authutil`):** Handles the
    OIDC login flow, secure credential storage (keyring), token management
    (retrieval, refresh), and kubeconfig updates.
*   **API Interaction (`internal/resourcemanager`, etc.):** Contains logic for
    communicating with Datum Cloud APIs (e.g., REST for listing
    organizations). Uses standard Go HTTP clients, typically configured with
    OAuth2 transports managed by `authutil`.
*   **Command Structure (`internal/cmd`, `main.go`):** Defines the CLI commands,
    flags, and arguments using Cobra.
*   **Output Formatting (`internal/output`):** Provides helpers for displaying
    command output in different formats (table, JSON, YAML).
