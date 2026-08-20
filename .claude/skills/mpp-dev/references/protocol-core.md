# MPP Core Protocol — `draft-httpauth-payment-00`

Source of truth: `github.com/tempoxyz/mpp-specs` (published at `paymentauth.org`), authored by
Tempo Labs and Stripe. This is the payment-method-agnostic core: the `Payment` HTTP
Authentication Scheme layered on RFC 9110's `WWW-Authenticate` / `Authorization` mechanism.

## The six-step flow

```
Client                                            Server
   │  (1) GET /resource                              │
   ├─────────────────────────────────────────────────>│
   │  (2) 402 Payment Required                        │
   │      WWW-Authenticate: Payment id="..",          │
   │        realm="..", method="..", intent="..",     │
   │        request="..", expires="..."               │
   │<─────────────────────────────────────────────────┤
   │  (3) Client fulfills the challenge                │
   │      (signs a tx, pays an invoice, mints a token) │
   │  (4) GET /resource                                │
   │      Authorization: Payment <credential>          │
   ├─────────────────────────────────────────────────>│
   │  (5) Server verifies + settles                   │
   │  (6) 200 OK / Payment-Receipt: <receipt>          │
   │<─────────────────────────────────────────────────┤
```

**Three protocol nouns — always capitalize them when writing docs/UI copy:**
- **Challenge** — what a resource costs and which payment methods are accepted (the 402 response).
- **Credential** — the payment proof the client sends back.
- **Receipt** — confirmation of settlement, attached to the successful response.

## Status code semantics — this is the part people get wrong

| Condition | Status | Response |
|---|---|---|
| No credential provided | 402 | Fresh Challenge |
| Malformed credential | 402 | Fresh Challenge + `malformed-credential` problem |
| Unknown / expired / reused Challenge `id` | 402 | Fresh Challenge + `invalid-challenge` problem |
| Proof invalid (bad signature, wrong amount, etc.) | 402 | Fresh Challenge + `verification-failed` problem |
| Payment verified | 200 | Resource + `Payment-Receipt` |
| Payment verified but policy denies access | **403** | No Challenge |

- **402 is always the payment barrier**, including retries after a failed proof. Don't reuse 401
  for "your payment didn't work" — 401 is reserved for non-payment auth failures (missing API key,
  bad session, etc).
- **403 means "you paid correctly, you're still not allowed in."** If you find yourself returning
  402 for an authorization failure unrelated to payment, that's a protocol violation.
- Servers **MUST authenticate before issuing a 402 Challenge** if the resource also requires auth —
  otherwise you leak pricing/payment-requirement information to unauthenticated callers.
- `Cache-Control: no-store` is **mandatory** on every 402 response. `Cache-Control: private` is
  mandatory whenever a `Payment-Receipt` header is present.

## Message formats

### Challenge (`WWW-Authenticate: Payment`)

ABNF: `challenge = "Payment" [ 1*SP auth-params ]` using RFC 9110 auth-param syntax.

Required params: `id`, `realm`, `method`, `intent`, `request` (base64url, no padding,
JCS-canonicalized JSON per RFC 8785). Optional: `digest` (RFC 9530 content-digest — bind the
Challenge to a request body), `expires` (RFC 3339), `description`, `opaque`.

```http
HTTP/1.1 402 Payment Required
Cache-Control: no-store
WWW-Authenticate: Payment id="x7Tg2pLqR9mKvNwY3hBcZa",
    realm="api.example.com",
    method="example",
    intent="charge",
    expires="2025-01-15T12:05:00Z",
    request="eyJhbW91bnQiOiIxMDAwIiwiY3VycmVuY3kiOiJVU0QiLCJyZWNpcGllbnQiOiJhY2N0XzEyMyJ9"
```

Decoded `request`: `{"amount":"1000","currency":"usd","recipient":"acct_123"}`

### Challenge ID binding — the anti-forgery root of trust

Servers MUST cryptographically bind `id` to `realm|method|intent|request|expires|digest|opaque`.
Recommended: **HMAC-SHA256** over those 7 fields joined with `|`, base64url-encoded, keyed by a
server secret (see `security-testing.md`). In `mppx` this secret is `MPP_SECRET_KEY` — if it
leaks, an attacker can mint Challenges that look server-issued for your realm. This is the single
most important secret in an MPP deployment; treat it like a JWT signing key.

### Credential (`Authorization: Payment`)

Base64url (no padding) JSON: `challenge` (the echoed Challenge object), `payload`
(method-specific proof), optional `source` (payer identity — recommended as a
`did:pkh:eip155:<chainId>:<address>` style DID for on-chain payers).

### Receipt (`Payment-Receipt` header)

Base64url JSON: `status` (always `"success"` — receipts are never issued on failure), `method`,
`timestamp` (RFC 3339), `reference` (method-specific: tx hash, invoice id, PaymentIntent id).

### Client preference negotiation (`Accept-Payment`)

Content-negotiation-style header for clients to declare which method/intent combos they can
fulfill, with `q` weights and wildcards:

```http
Accept-Payment: tempo/charge, tempo/session, stripe/charge;q=0.5, solana/charge;q=0.3
```

## Intents

| Intent | Meaning | Status |
|---|---|---|
| `charge` | One-off payment for a single resource/request | Formalized, most complete |
| `session` | Payment channel — reserve funds, draw down per request (streaming/pay-as-you-go) | Formalized (Tempo-native) |
| `subscription` | Recurring payment | Formalized |
| `zero-dollar` (`amount: 0`) | No funds move; client signs a `type: "proof"` attestation binding to the Challenge id | Used for long-running jobs, paid-unlock-then-free-access, multi-step agent workflows |

New intents start "experimental" inside a specific method's spec file. Per `CONTRIBUTING.md`,
once **2 or more methods** implement the same pattern, it gets promoted/extracted into
`specs/intents/` as a formal, method-agnostic intent. Clients and servers **MUST ignore unknown
Challenge parameters and unrecognized intents/methods** — this is how forward-compatibility works;
don't write brittle code that throws on an unfamiliar field.

## Error codes (RFC 9457 Problem Details)

Base URI: `https://paymentauth.org/problems/`

| Code | HTTP | Meaning |
|---|---|---|
| `payment-required` | 402 | Resource requires payment |
| `payment-insufficient` | 402 | Amount too low |
| `payment-expired` | 402 | Challenge or authorization expired |
| `verification-failed` | 402 | Proof invalid |
| `method-unsupported` | 400 | Method not accepted by this server |
| `malformed-credential` | 402 | Invalid credential format |
| `invalid-challenge` | 402 | Challenge ID unknown, expired, or already used (replay) |

JSON-RPC/MCP transport maps this to error codes `-32042` (Payment Required) and `-32043`
(Payment Verification Failed) in the implementation-defined server-error range, plus standard
`-32602` (invalid params) for a malformed credential.

## Versioning

Layered, not a single wire version:
- **Core scheme name** (`Payment`) — evolves via optional-field addition; a real breaking change
  registers a new scheme name (e.g. `Payment2`), not a version bump.
- **Methods** — carry an optional `version` field inside `methodDetails`; absent = version 1;
  breaking change bumps to 2; a sufficiently different method registers a new method id instead.
- **Intents** — no wire version; breaking change requires a new intent id (e.g. `charge-v2`).

## Authentication vs. payment

MPP treats *payment* as a concern separate from *authentication*. If a resource needs both,
authenticate first (401 on failure), and only issue a 402 Challenge to already-authenticated
callers — don't leak pricing to anonymous requesters. Payer identity, when present, rides in the
Credential's `source` field, recommended in W3C DID format.
