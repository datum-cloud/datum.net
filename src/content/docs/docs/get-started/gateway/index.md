---
title: Create a Datum Gateway (Reverse Proxy)
weight: 1
sidebar:
  label: Gateway
---

## Before you begin

This tutorial assumes you have already:

- [Registered a Datum account](../get-started)
- [Installed and configured the necessary tools](../)
- [Created a Datum project](../)

## Understanding Datum Gateways

A Datum Gateway acts as a reverse proxy that manages incoming traffic to your services. It's built on top of the Kubernetes Gateway API specification and provides a way to:

- Route traffic to different services based on hostnames and paths
- Load balance requests across multiple backend services
- Apply TLS termination
- Monitor traffic flow

This tutorial will create a Datum Gateway that will use
[example.com](https://www.example.com) as the origin service.

## Creating a Basic Gateway

Let's start by creating a simple Gateway that will listen for HTTP traffic on port 80. Here's a basic Gateway configuration:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: my-gateway
spec:
  gatewayClassName: datum-external-global-proxy
  listeners:
    - name: http
      protocol: HTTP
      port: 80
      allowedRoutes:
        namespaces:
          from: Same
```

Apply this configuration using kubectl:

```shell
kubectl apply -f gateway.yaml
```

Verify the Gateway was created:

```shell
kubectl get gateway
```

## Configuring Endpoints

Endpoints in Datum Gateway are defined using EndpointSlice resources, which provide a more efficient way to manage service endpoints. Here's an example of how to define endpoints for your gateway:

```yaml
apiVersion: discovery.k8s.io/v1
kind: EndpointSlice
metadata:
  name: my-endpoint
addressType: IPv4
endpoints:
- addresses:
  - 23.192.228.80
  conditions:
    ready: true
    serving: true
- addresses:
  - 23.192.228.84
  conditions:
    ready: true
    serving: true
ports:
- name: https
  appProtocol: https
  port: 443
```

This EndpointSlice configuration:
- Defines a set of endpoints for a service named "my-endpoint"
- Specifies the endpoint by 2x IPv4 addresses
- Includes port configuration for HTTP traffic
- Includes readiness conditions for the  endpoint

Apply the endpoints:

```shell
kubectl apply -f endpoints.yaml
```

## Creating Routes

Routes define how traffic should be directed to your services. Let's create a simple HTTPRoute that directs traffic to a backend service:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: my-route
spec:
  parentRefs:
    - name: my-gateway
      kind: Gateway
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - group: discovery.k8s.io
          kind: EndpointSlice
          name: my-endpoint
          port: 443
      filters:
        - type: URLRewrite
          urlRewrite:
            hostname: "example.com"
```

This route configuration:
- Attaches to our previously created gateway
- Routes all requests with path prefix "/"  with a hostname rewrite to "example.com".

Apply the route:

```shell
kubectl apply -f route.yaml
```

## Verifying the Setup

Check the status of your gateway components:

```shell
# Check Gateway status
kubectl get gateway -o wide
```

Note: This output will provide the address to be used with cURL, below.

# Check EndpointSlices
```shell
# Check Endpoint status
kubectl get endpointslices
```

# Check Routes
```shell
# Check Route status
kubectl get httproute
```

# Check the Service using cURL

```shell
# Use cURL to test the gateway
curl -sv http://$ADDRESS (ending in `datum-dns.net from above step`)
```

Alternatively, copy/paste $ADDRESS into a browser to view example.com via a
Datum gateway.

## Next Steps

- Understand how to use Datum's observability tools via Telemetry Exporters.

## Troubleshooting

Common issues and their solutions:

1. Gateway not accepting traffic:
   - Verify the Gateway is in the "Ready" state
   - Check that the gatewayClassName is properly configured to be `datum-external-global-proxy`.
   - Ensure the listeners are correctly defined

2. Endpoints not receiving traffic:
   - Ensure the EndpointSlice addresses are correct
   - Verify the ports are correctly configured
   - Check that the endpoints are marked as ready

