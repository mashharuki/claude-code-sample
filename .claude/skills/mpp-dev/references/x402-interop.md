# MPP vs. x402

Both protocols trigger on HTTP 402 and were both actively used at research time (2026) for
agentic/machine payments. They are **complementary, not exclusive** — Stripe's own announcement
lists support for "both MPP and x402" side by side, and `mppx`'s `evm.charge()` method natively
speaks both.

## Positioning

| Dimension | MPP | x402 |
|---|---|---|
| Backers | Co-authored by **Stripe + Tempo** | Popularized by Coinbase |
| Wire format | Registered **IETF HTTP Authentication Scheme** (`WWW-Authenticate: Payment` / `Authorization: Payment`), IANA-style method/intent registries, RFC 9457 problem-details errors | Custom header/JSON scheme, `exact` payment scheme |
| Rails | Stablecoins (Tempo native + any EVM chain) **and** fiat (cards/BNPL via Stripe Shared Payment Tokens), plus Lightning/Solana/Hedera/Stellar/NEAR method directories | Primarily HTTP-402-triggered stablecoin (crypto-native) flows |
| Structure | Layered core / intents / methods / extensions, with a documented promotion process (2+ methods → formal intent) | Flatter — a payment `scheme` (e.g. `exact`) per network |
| Transport | HTTP native + first-class **JSON-RPC/MCP** binding (`-32042`/`-32043` error codes, `_meta` fields) | HTTP-based; no equivalent formal MCP transport spec observed |
| Discovery | OpenAPI `x-payment-info` extension; explicitly modeled after x402scan's discovery approach | `x402scan` project, `/.well-known/x402` fallback |

MPP's discovery spec explicitly acknowledges the relationship:

> "The x402 protocol uses HTTP 402 responses as the primary payment signal. This specification
> separates discovery (pre-request) from the payment challenge (at-request)... The x402scan
> project uses OpenAPI documents as the canonical discovery signal... This specification adopts
> the same OpenAPI-first approach."

## Practical interop: one endpoint, both protocols

`mppx`'s `evm.charge()` method is dual-protocol-aware out of the box — it verifies either a native
MPP Credential *or* an x402 `exact`-scheme payment against the same route, dispatching internally:

```ts
// server.ts
import { Mppx, evm } from 'mppx/server'

const mppx = Mppx.create({
  methods: [
    evm.charge({
      currency: evm.assets.baseSepolia.USDC,
      recipient: '0xYourAddress',
      x402: { facilitator: 'https://example.com/facilitator' },
    }),
  ],
})

const paid = mppx.evm.charge({ amount: '0.01', description: 'Premium API access' })
```

```ts
// client.ts — a plain x402-style client works against this same server
import { Fetch, evm } from 'mppx/client'
import { privateKeyToAccount } from 'viem/accounts'

const fetch = Fetch.from({
  methods: [evm.charge({
    account: privateKeyToAccount('0x...'),
    currencies: [evm.assets.baseSepolia.USDC],
    maxAmount: '1.00',
  })],
})

const response = await fetch('https://mpp.dev/api/ping/paid')
```

## When to reach for which

- **Building a fresh integration with no legacy x402 clients to support** → use `tempo` or plain
  `evm.charge()` without the `x402` option; you get the richer MPP feature set (sessions,
  zero-dollar proofs, MCP transport, Stripe interop via `compose()`).
- **You already have x402 clients in the wild, or want to accept payments from agents built
  against Coinbase's x402 tooling** → register `evm.charge({ x402: { facilitator } })` so one
  endpoint accepts both; don't stand up two separate routes.
- **x402 interop is EVM-only** — Tempo-native and Stripe-native payments have no x402 equivalent,
  so a Tempo/Stripe route only ever speaks native MPP.
- Don't assume every x402 feature (Bazaar-style discovery quirks, x402-specific SDKs from other
  vendors) is automatically covered by MPP's discovery spec just because the wire trigger (402) is
  shared — check `references/mcp-and-discovery.md` and the actual `x-payment-info` schema before
  promising a client "full x402 compatibility."
