# Datum glossary for diagram labels

Starting point taken from the "How debugging a 503 turned into an IPv6 crash course" article. Confirm against https://www.datum.net/docs before drawing anything new.

- **Datum ALB**: Datum's application load balancer, Envoy running at the nearest edge. Clients reach it over anycast (A and AAAA records), and it opens a new connection into the network from an `fd42:…` address, passing the client address in `X-Forwarded-For`.
- **Network (gVPC)**: one per project, a `/48` (for example `fd20:0:53::/48`); one `/64` per location (us-west-1, us-central-1, us-east-1) and one `/96` per instance.
- **Instances**: IPv6-only inside the network. Each instance gets its own link, so link-local and `ff02::1` multicast do not reach neighbours; traffic goes via the router (`fd20:0:53::1`).
- **Across regions**: packets are wrapped by eBPF in an outer IPv6 header (SRv6) addressed to the destination node; backbone routers read only the outer header; the destination node unwraps and redirects into the instance. Same node: the kernel routes inside the VRF.
- **Egress**: DNS64 + NAT64 per location, so an IPv4-only name resolves to a `64:ff9b::…` address and leaves from a shared IPv4. A literal IPv4 address (for example `1.1.1.1`) has nothing to translate and fails.
- **Common failure**: configs from other platforms that assume IPv4 (`listen 8080;` on `0.0.0.0`, literal DNS servers, `preferIPv4Stack`, `169.254.169.254`) surface as a 503 on Datum.
- **Checks to run before moving**: `grep`, `ss -tln`, `dig AAAA ipv4only.arpa`.
