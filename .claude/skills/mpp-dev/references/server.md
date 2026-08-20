# Server Integration — `mppx/server`

## Minimal server (framework-agnostic `Request`/`Response`)

```ts
import { Mppx, tempo } from 'mppx/server'

const mppx = Mppx.create({
  secretKey: process.env.MPP_SECRET_KEY!,   // >= 32 bytes — see security-testing.md
  methods: [
    tempo({
      account,
      currency: usdc,
      recipient: account.address,
      feePayer: true,     // server sponsors gas — payer only signs the transfer
      testnet: true,       // Tempo Moderato (chain id 42431)
    }),
  ],
})

export async function handler(request: Request): Promise<Response | null> {
  const url = new URL(request.url)
  if (url.pathname === '/api/photo') {
    const result = await mppx.charge({ amount: '0.01', description: 'Random stock photo' })(request)
    if (result.status === 402) return result.challenge
    const res = await fetch('https://picsum.photos/1024/1024')
    return result.withReceipt(Response.json({ url: res.url }))
  }
  return null
}
```

> Note bare `tempo({...})` here vs. `tempo.charge({...})` in the `compose()` example below — see
> the "`tempo(...)` vs `tempo.charge(...)`" note in [methods.md] before assuming they're
> interchangeable in a multi-intent setup.

The pattern is always: **call the charge handler, branch on `result.status === 402`, otherwise
do the real work and wrap the response in `result.withReceipt(...)`.** `mppx.charge()` (or
`mppx.compose()`) handles Challenge generation, Credential verification, and settlement
internally — don't hand-roll header parsing.

`Mppx.create()` throws immediately if `secretKey` is missing (no silent insecure default):
`"Missing secret key. Set the MPP_SECRET_KEY environment variable or pass secretKey to Mppx.create()."`

## Composing multiple payment methods on one route

Use `compose()` when you want to accept several methods/currencies for the same resource and let
the client pick:

```ts
import { Mppx, tempo, stripe } from 'mppx/server'
import Stripe from 'stripe'   // standard Stripe Node SDK, not part of mppx — `client` below is this instance

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!)

const mppx = Mppx.create({
  methods: [
    tempo.charge({ currency: USDC, recipient: '0x...' }),
    stripe.charge({
      client: stripeClient,
      networkId: 'internal',
      currency: 'usd',
      decimals: 2,
      paymentMethodTypes: ['card'],
    }),
  ],
  secretKey,
})

app.get('/api/resource', async (req) => {
  const result = await mppx.compose(
    ['tempo/charge', { amount: '100' }],
    ['stripe/charge', { amount: '100' }],
  )(req)
  if (result.status === 402) return result.challenge
  return result.withReceipt(new Response('OK'))
})
```

The resulting Challenge advertises both offers; the client (or `Accept-Payment` header) decides
which one to fulfill. This is the mechanism behind "accept crypto or card on the same endpoint."

## Hooks

```ts
mppx.onChallengeCreated(({ challenge }) => { /* log/metrics */ })
mppx.onPaymentSuccess(({ receipt }) => { /* fulfillment, analytics, webhook */ })
mppx.onPaymentFailed(({ problem }) => { /* alerting */ })
mppx.on('*', (event) => { /* catch-all */ })
```

## Framework middlewares

All four share the same `payment(intent, options)` shape — pick the one matching your stack, the
call pattern is otherwise identical.

### Express

```ts
import express from 'express'
import { Mppx, tempo } from 'mppx/express'

const app = express()
const mppx = Mppx.create({ methods: [tempo()] })

app.get('/premium', mppx.charge({ amount: '1' }), (req, res) => {
  res.json({ data: 'paid content' })
})
```

### Hono

```ts
import { Hono } from 'hono'
import { Mppx, tempo } from 'mppx/hono'

const mppx = Mppx.create({ methods: [tempo()] })
const app = new Hono()

app.get('/premium', mppx.charge({ amount: '1' }), (c) => c.json({ data: 'paid content' }))
```

### Next.js (App Router)

```ts
// app/api/premium/route.ts
import { Mppx, tempo } from 'mppx/nextjs'

const mppx = Mppx.create({ methods: [tempo()] })
export const GET = mppx.charge({ amount: '1' })(() => Response.json({ data: 'paid content' }))
```

### Elysia

```ts
import { Elysia } from 'elysia'
import { Mppx, tempo } from 'mppx/elysia'

const mppx = Mppx.create({ methods: [tempo()] })
new Elysia().guard({ beforeHandle: mppx.charge({ amount: '1' }) }, (app) =>
  app.get('/premium', () => ({ data: 'paid content' })),
)
```

## Discovery — advertise pricing before the 402 round-trip

Every middleware exports a `discovery()` helper that mounts `GET /openapi.json`, annotated with an
`x-payment-info` extension (`offers[]`: amount, currency, description, intent, method) and
optional `x-service-info`. This lets agents/aggregators (MPPScan, the MPP Services directory) find
priced endpoints without probing for 402s first.

```ts
import express from 'express'
import { Mppx, tempo, discovery } from 'mppx/express'

const app = express()
const mppx = Mppx.create({ methods: [tempo()] })
discovery(app, mppx, { /* DiscoveryConfig */ })
```

**Discovery documents are hints, not authoritative.** The runtime 402 Challenge is always the
source of truth for what a request actually costs — don't skip Challenge verification just
because a client says it already read your `/openapi.json`.

## Refunds — mostly out of protocol

MPP defines **no refund protocol** for the `charge` intent — if you need to refund, your server
sends funds back to `credential.source` directly, out of band. **`session` intent is the
exception**: unclaimed reserved funds in a Tempo payment channel return automatically on
expiry/close, so channel-based billing gets refund semantics "for free" while one-off charges
don't.

## Which method(s) to register

See `methods.md` for the full signing-scheme breakdown before wiring a method you haven't used —
`tempo`, `evm`, and `stripe` cover the large majority of real deployments (stablecoin-native,
broad-EVM/x402-compatible, and card-based respectively).
