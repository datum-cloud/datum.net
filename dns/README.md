# datum.net DNS records (IaC)

Corp/marketing/email DNS records for `datum.net`, managed as code. `datum.net`
is served from `DNSZone` object **`datum-net-xq088a`** in the datum-cloud
project control plane; these `DNSRecordSet`s reference it via `spec.dnsZoneRef`.

## Scope

Records owned by this repo (the corp domain), by the repo-ownership boundary:

- apex `A` / `AAAA` (the website) and Google Workspace `MX`
- SaaS domain-verification `TXT` and SPF
- DKIM (`s1`/`s2._domainkey` SendGrid, `resend._domainkey.*`) and DMARC
- corp utility subdomains: `status`, `go`, `wiki`, `edge`

The infra-wiring CNAMEs (`www`/`docs` → prism, `api`/`admin`/`cloud`/`auth` →
`prod.env`) are **not** here — they live in `datum-cloud/infra` under
`dns/datum.net/`.

## Applying

The apply path is `datumctl` — the customer DNS-as-code path — since the zone
lives in a project control plane:

```
datumctl apply --project datum-cloud -n default -f dns/dnsrecordsets.yaml
```

> [!NOTE]
> The CI job that runs this on merge (service-account `datumctl login
> --credentials`, scoped to the datum-cloud project with RBAC to write
> `DNSRecordSet`) is a **follow-up** — not yet wired. Until then, apply is
> manual.

## Provenance

- Values scraped from live `dig`/`host` against `ns1-4.datumdomains.net`.
- The zone already exists; these adopt records in place (additive per-RRset, no prune, no gap).
- DNSSEC / SOA / NS system records are managed by the platform and are not represented here.
- `datum-net-dmarc-send-subdomains` is already live in prod (applied via `datumctl`).
