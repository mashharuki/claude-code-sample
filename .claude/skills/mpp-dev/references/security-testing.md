# Security & Testing

## The root secret: `MPP_SECRET_KEY`

Every Challenge `id` is an HMAC-SHA256 over `realm|method|intent|request|expires|digest|opaque`,
keyed by this server secret. **If it leaks, an attacker can mint Challenges that appear
server-issued for your realm** — treat it exactly like a session-signing / JWT secret:

- Minimum 32 bytes, from a secrets manager, never checked into source or logged.
- Never log the `Authorization: Payment` or `Payment-Receipt` header values — they contain signed
  payment proofs and settlement references.
- `Cache-Control: no-store` is mandatory on every 402 response; `Cache-Control: private` is
  mandatory whenever `Payment-Receipt` is present — an intermediate cache serving a stale 402 or a
  receipt meant for a different requester is a real bug class here, not a theoretical one.
- Support **staged key rotation** (accept both old and new key for a transition window) rather
  than a hard cutover — a hard cutover invalidates every in-flight Challenge at the rotation
  instant.
- For state-changing requests (POST/PUT/PATCH), use the Challenge's `digest` parameter (RFC 9530
  content-digest) to bind the Challenge to the specific request body, not just the URL/realm —
  otherwise a signed Credential for one body could be replayed against a different body at the
  same endpoint.

## Per-method binding — verify the client actually did this

A Credential that merely *references* a Challenge id isn't enough; the signature itself must be
cryptographically derived from it, or the Credential is forgeable by anyone who can read the 402
response (which is public). Concretely:

- **`evm` method**: `nonce` (EIP-3009) or the `PaymentWitness` struct (Permit2) must equal/include
  `keccak256(challenge.id + challenge.realm)`. If you're implementing a new EVM-based method and
  the nonce/witness doesn't derive from the Challenge, you've built a replayable payment.
- **`tempo` zero-amount `proof`**: the EIP-712 `Proof` struct signs `challengeId` directly.
- When reviewing someone else's method implementation (or writing a new one), the first question
  to ask is: **"what part of the signed payload comes from the Challenge, and can I replay this
  signature against a different Challenge?"**

## Common protocol-level mistakes to flag in review

| Mistake | Why it's wrong |
|---|---|
| Returning 401 for a failed payment proof | 402 is the payment barrier, always — 401 is for non-payment auth |
| Returning 402 for a policy/authorization denial after successful payment | Should be 403 — 402 implies "pay to proceed," not "you paid but still can't" |
| Issuing a 402 Challenge to an unauthenticated caller on a resource that also needs auth | Leaks payment/pricing info pre-authentication; authenticate first |
| Caching a 402 response | Missing `Cache-Control: no-store`; stale Challenges get replayed |
| A Credential nonce/witness that doesn't derive from `challenge.id` | Signature is replayable against other Challenges — see binding section above |
| Trusting a discovery document (`/openapi.json`) instead of verifying the runtime Challenge | Discovery is advisory; only the 402 response is authoritative for actual price |
| Minting a Stripe Shared Payment Token client-side | Needs a Stripe secret key — must be server-proxied, with server-controlled amount/currency |
| Assuming `charge` intent supports refunds | It doesn't — refunds are out-of-protocol for `charge`; only `session` auto-refunds unclaimed reserves |

## Testing conventions (matches `mppx`'s own test suite style)

`mppx` overrides `vitest` internally (imports come from `'vp/test'`, not `'vitest'`, when working
inside the `mppx` monorepo itself — for your own project consuming `mppx` as a dependency, regular
`vitest` is fine). Naming conventions to mirror:

- `*.test.ts` — unit tests.
- `*.test-d.ts` — type-only tests (assert inferred types, not runtime behavior).
- `*.fuzz.test.ts` — property/fuzz tests (the upstream SDK uses `fast-check` for this, e.g.
  `Challenge.fuzz.test.ts`) — valuable for anything that parses/serializes Challenge or Credential
  wire format, since malformed input handling is a real attack surface.
- `*.integration.test.ts` — exercises a real (test)network, not mocks.
- `*.conformance.test.ts` — checks an implementation against the spec's required behaviors.

Representative unit test (Vitest inline snapshots, including the Zod validation-error shape):

```ts
import { PaymentRequest } from 'mppx'
import { Methods } from 'mppx/tempo'
import { describe, expect, test } from 'vitest'

describe('fromMethod', () => {
  test('creates a validated request from intent', () => {
    const request = PaymentRequest.fromMethod(Methods.charge, {
      amount: '1',
      currency: '0x20c0000000000000000000000000000000000001',
      decimals: 6,
      recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE00',
    })
    expect(request).toMatchInlineSnapshot(`
      {
        "amount": "1000000",
        "currency": "0x20c0000000000000000000000000000000000001",
        "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f8fE00",
      }
    `)
  })

  test('throws on invalid request', () => {
    expect(() =>
      PaymentRequest.fromMethod(Methods.charge, { amount: 123, currency: '0x20c...' } as any),
    ).toThrow()
  })
})
```

## What to test in your own integration

1. **Happy path**: unpaid request → 402 → sign → retry → 200 with `Payment-Receipt`.
2. **Replay**: reuse a Credential (or its Challenge id) on a second request → must be rejected
   with `invalid-challenge`, not silently accepted.
3. **Expired Challenge**: sign after `expires` has passed → `payment-expired`.
4. **Tampered request**: mutate the decoded `request` object and re-sign against the *original*
   Challenge id → verification must fail (`verification-failed`), proving the binding actually
   covers the request body, not just the id.
5. **Insufficient amount**: sign a smaller amount than the Challenge specifies →
   `payment-insufficient`.
6. **Unsupported method/intent**: request a method the server doesn't register → `400
   method-unsupported`, not a 402 (don't advertise payment terms for something you can't accept).
7. **Cache headers**: assert `Cache-Control: no-store` on every 402 and `private` whenever a
   receipt is present — easy to regress silently behind a CDN/reverse-proxy config change.

## Testnets

- **Tempo Moderato** — testnet, chain id `42431`. (`98865` is a deprecated id some old examples
  reference — don't use it.)
- **Base Sepolia** — `84532`, for `evm`-method testing (also the default x402 interop testnet).
- **Stripe test mode** — standard Stripe test API keys / test cards for `stripe` method
  end-to-end tests.

Always develop and test against testnets/test-mode before pointing `recipient`/`account` config at
mainnet addresses or live Stripe keys.
