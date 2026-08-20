# MCP Monetization & Service Discovery

## Monetizing an MCP server tool

MPP defines a first-class JSON-RPC/MCP transport binding (`draft-payment-transport-mcp-00`), so
paid MCP tools don't need an ad-hoc payment scheme bolted onto tool results. Conventions:

- Credentials arrive in `_meta["org.paymentauth/credential"]` on the tool-call request.
- A payment-required condition is signaled as an `McpError` with code **`-32042`**, Challenge in
  `error.data`. Verification failure uses **`-32043`**. Malformed credential structure uses the
  standard **`-32602`** (invalid params).
- Receipts are attached via `_meta["org.paymentauth/receipt"]` on the successful tool result.

```ts
import { Mppx, tempo } from 'mppx/server'
import { Transport } from 'mppx'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'  // standard MCP SDK, not part of mppx

const mppx = Mppx.create({
  secretKey: process.env.MPP_SECRET_KEY!,
  methods: [tempo.charge({ /* ... */ })],
  transport: Transport.mcpSdk(),
})

const server = new McpServer({ name: 'paid-tools', version: '1.0.0' })

server.tool('get_premium_data', schema, async (params, extra) => {
  const result = await mppx.charge({ amount: '0.01' })(extra)
  if (result.status === 402) throw result.challenge   // becomes McpError -32042
  return result.withReceipt({ content: [{ type: 'text', text: JSON.stringify(fetchData()) }] })
})
```

`@modelcontextprotocol/sdk` is an **optional peer dependency** of `mppx` — install it yourself
(`>=1.25.0`) alongside `mppx` when building an MCP server. `server` and its `.tool()` registration
follow the standard MCP TypeScript SDK API, not something `mppx` defines — consult the MCP SDK's
own docs for tool-schema/handler shape beyond the payment-gating logic shown here.

## Service discovery

Two layers, don't conflate them:

1. **Per-service discovery document** — `GET /openapi.json` with `x-payment-info` /
   `x-service-info` OpenAPI extensions (see `server.md`'s `discovery()` helper). This is what an
   individual API exposes about itself.
2. **Ecosystem-level directories** — third parties that crawl/aggregate discovery documents:
   - **MPPScan** (`mppscan.com`) — public scanner/index of MPP-enabled services.
   - **MPP Services directory** (`mpp.dev/services`) — curated listing, backed by a JSON Schema
     (`schemas/discovery.schema.json`) with `categories` enum
     `["ai","blockchain","compute","data","media","search","social","storage","web"]` and
     `EndpointPayment.intent` enum `charge|session`.
   - A **read-only Services MCP server** at `mpp.dev/mcp/services` lets agents query the directory
     directly via MCP instead of scraping the website.

Both discovery layers are advisory — the runtime 402 Challenge remains authoritative for actual
pricing at request time (see `server.md`).

## Scoping what crawler/agent traffic may do on your own service

If you publish `.well-known/agent-permissions.json` (the pattern `mpp.dev` itself uses), separate
what an autonomous agent may do from what needs a human in the loop:

```json
{
  "allowedActions": ["read-documentation", "read-discovery", "read-openapi", "read-skill"],
  "disallowedActions": ["execute-payment", "submit-credential", "write-data"],
  "humanRequiredActions": ["execute-payment", "send-transaction", "store-private-key"]
}
```

This is a documentation/policy signal for well-behaved crawlers, not an enforcement mechanism by
itself — pair it with actual server-side authorization if the distinction matters for your threat
model.

## `.well-known/mcp.json`

A separate, generic MCP-server-discovery mechanism (RFC 9727-style `api-catalog` linkset) — don't
confuse this with the *payment* discovery document above. It just tells a client "here's an MCP
server for this domain, protocol version 2025-06-18," independent of whether that MCP server has
any paid tools.
