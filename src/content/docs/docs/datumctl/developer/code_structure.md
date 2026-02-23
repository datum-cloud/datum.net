---
title: "Code structure"
sidebar:
  order: 6
---

The `datumctl` codebase is organized primarily within the `internal` directory,
following common Go practices.

## Key directories

*   **`internal/cmd/`**: Contains the definitions for all CLI commands,
    structured using the Cobra library.
    *   `internal/cmd/auth/`: Commands related to authentication (`login`,
        `logout`, `list`, `get-token`, `update-kubeconfig`).
    *   `internal/cmd/organizations/`: Commands for managing organization
        resources (currently `list`).
    *   `internal/cmd/root.go`: Defines the root `datumctl` command and ties
        subcommands together.
*   **`internal/authutil/`**: Provides shared utilities and types specifically
    for authentication handling.
    *   `credentials.go`: Defines the `StoredCredentials` struct, functions for
        interacting with the keyring (`GetActiveCredentials`,
        `GetStoredCredentials`), OIDC token source creation (`GetTokenSource`),
        and hostname derivation (`DeriveAPIHostname`). Constants for keyring
        service/keys are also defined here.
*   **`internal/keyring/`**: A simple wrapper around the `go-keyring` library,
    primarily adding timeouts to keyring operations.
*   **`internal/output/`**: Contains helpers for formatting CLI output (e.g.,
    `CLIPrint` for tables, JSON, YAML).
*   **`internal/resourcemanager/`**: (Example) Likely contains clients and logic
    for interacting with specific Datum Cloud API resource types (like
    Organizations).

## Main entrypoint

*   **`main.go`**: The main application entrypoint. It typically sets up and
    executes the root Cobra command defined in `internal/cmd/root.go`.

## Dependencies

Key external dependencies include:

*   `github.com/spf13/cobra`: CLI framework.
*   `golang.org/x/oauth2`: OAuth2 client library.
*   `github.com/coreos/go-oidc/v3/oidc`: OpenID Connect client library.
*   `github.com/zalando/go-keyring`: Secure credential storage.
*   `k8s.io/client-go/tools/clientcmd`: Kubernetes client configuration API (for
    `update-kubeconfig`).
*   `github.com/pkg/browser`: For opening the web browser during login.
