# Client Integration — `mppx/client`

`mppx` is the TypeScript SDK (npm package name is exactly **`mppx`** — there is no `@wevm/mppx`
and no `mpp` package; `mpp` on npm is an unrelated 2017 WebSocket library, don't install it by
mistake). Current version at research time: `0.8.17`.

## Minimal client

```ts
import { Mppx, tempo } from 'mppx/client'
import { privateKeyToAccount } from 'viem/accounts'

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)

const mppx = Mppx.create({
  methods: [tempo({ account })],
})

// mppx.fetch transparently retries a 402'd request after signing a payment
const res = await mppx.fetch('/api/photo')
if (!res.ok) throw new Error('Request failed')
const data = await res.json()
```

`Mppx.create()` returns:

```ts
type Mppx = {
  fetch: Fetch                 // payment-aware fetch wrapper
  rawFetch: typeof fetch       // the underlying unwrapped fetch
  methods: Methods
  transport: Transport
  createCredential(response, context?, options?): Promise<string>
  onChallengeReceived(handler): Unsubscribe
  onCredentialCreated(handler): Unsubscribe
  onPaymentFailed(handler): Unsubscribe
  onPaymentResponse(handler): Unsubscribe
}
```

Config options worth knowing:
- `polyfill?: boolean` (default `true`) — patches `globalThis.fetch` globally so *any* fetch call
  in your app gets 402-handling. Set `false` if you want to scope payment-awareness to only calls
  made through `mppx.fetch` explicitly (recommended when your app also talks to unrelated APIs you
  don't want silently retried with a wallet signature).
- `maxPaymentRetries` — cap on 402→retry loops (protects against a misbehaving/malicious server
  issuing endless fresh Challenges).
- `orderChallenges` — a function to pick which offered Challenge to fulfill when a server
  advertises several methods (see the x402-interop example below).
- `paymentPreferences` — declarative version of the same, rendered as the `Accept-Payment` header.
- `onChallenge` — intercept/inspect a Challenge before the client auto-fulfills it (useful for
  spend-limit UI, "confirm this $X payment" prompts, or logging).

## Hooks — don't poll, subscribe

```ts
mppx.onChallengeReceived(({ challenge }) => console.log('offered:', challenge.method, challenge.intent))
mppx.onCredentialCreated(({ credential }) => console.log('signed'))
mppx.onPaymentFailed(({ problem }) => console.error('payment failed:', problem.type))
mppx.onPaymentResponse(({ response, receipt }) => console.log('settled:', receipt?.reference))
```

Wire these to UI state (spinner during signing, toast on failure) instead of wrapping every
`mppx.fetch` call in bespoke try/catch — the hooks fire regardless of which code path triggered
the payment.

## Multiple / dual-protocol clients (native MPP + x402)

Run two separate `Mppx` instances when a client needs to speak both native MPP and x402's
`exact` scheme to different servers — don't try to force one instance to do both:

```ts
const mpp = Mppx.create({
  methods: [tempo.charge({ account: mppAccount, getClient: () => tempoClient })],
  polyfill: false,
})

const x402 = Mppx.create({
  methods: [evm.charge({
    account: x402Account,
    currencies: [evm.assets.baseSepolia.USDC],
    maxAmount: '0.01',
    networks: [84532],
  })],
  orderChallenges: (candidates) =>
    candidates.filter(({ challenge }) => challenge.request.scheme === 'exact'),
  polyfill: false,
})
```

Note `maxAmount` — always set a spend ceiling on a client wallet an agent controls autonomously.
See "Agent spend limits" below for a stronger, server-enforced version of the same idea.

## Agent spend limits (Tempo access keys)

For an AI agent you don't want holding an unbounded key, delegate a budget-scoped **access key**
instead of the account's raw private key:

```ts
const accessKey = {
  expiry: Expiry.days(7),
  limits: [{ token: usdc, limit: numberToHex(parseUnits('10', 6)), period: 86_400 }],
  scopes: [Scopes.tip20(usdc).transfer({ recipients: [recipientAddress] })],
}
```

This caps total spend to 10 USDC.e per 86,400-second period, scoped to transfers of one token to
one recipient set, expiring in 7 days. Prefer this over "just give the agent the seed phrase and
trust the code."

## CLI

```bash
npm i -g mppx

# create account — stored in keychain, autofunded on testnet
mppx account create

# make a request — automatic payment handling, curl-like
mppx example.com

# open a new session instead of reusing the preferred channel
mppx example.com --session new

# inspect/close retained sessions (Tempo payment channels)
mppx sessions list
mppx sessions view <channel-id>
mppx sessions close <channel-id>
mppx sessions close --all --yes

# explicitly trust a custom session escrow advertised by a server
mppx example.com -M allowCustomEscrow=true
```

Useful for quickly probing whether a server's MPP integration actually works, without writing any
client code — reach for this first when debugging a server integration (see `security-testing.md`).

## Peer dependencies

`viem` is a **required, non-optional** peer dependency of `mppx` client code — every method's
account/signing types come from viem. `express` / `hono` / `elysia` /
`@modelcontextprotocol/sdk` are optional peers, only needed if you pull in the matching
middleware subpath (see `server.md`).
