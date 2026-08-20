# Payment Methods — signing schemes per rail

MPP's core protocol is payment-method agnostic; every rail defines its own credential `payload`
shape and verification logic under `specs/methods/<name>/` in `mpp-specs`, and as an
`mppx.<method>` export in the `mppx` SDK. Pick the method(s) that match your users' wallets —
most production servers `compose()` more than one (see `server.md`).

## Method comparison

| Method | Rail | Signing | Gas / fees | Notes |
|---|---|---|---|---|
| `tempo` | Tempo L1 (TIP-20 tokens, USDC.e) | EIP-712 (native tx) or `type:"proof"` for zero-amount | Sponsorable via `feePayer: true` | Native/first-class chain for MPP; only method with built-in `session` (payment channel) support |
| `evm` | Any EIP-155 EVM chain, ERC-20 | EIP-712 (Permit2 or EIP-3009), raw EIP-1559 tx, or tx-hash fallback | Client or server pays, depending on credential `type` | Also the **x402 interop** method — see `x402-interop.md` |
| `stripe` | Card / BNPL | None — opaque **Shared Payment Token** (`spt_...`) | Stripe's normal processing fees | No client-side crypto; SPT must be minted server-side |
| `usdc` | Chain-agnostic USDC | Method-specific | — | Separate from `evm`'s generic ERC-20 handling |
| `lightning` | Bitcoin Lightning | Lightning invoice / preimage | Network routing fees | Third-party SDKs exist (e.g. `@buildonspark/lightning-mpp-sdk`) for `mppx.compose()` |
| `solana`, `hedera`, `stellar`, `nearintents`, `card` | Native rails | Chain-native signing (ed25519 etc.) | Rail-dependent | Directories exist in `mpp-specs`; pull the spec on demand if you need one of these — don't guess the payload shape |

## `tempo` — native chain

- Chain IDs: **mainnet `4217`**, **testnet "Moderato" `42431`**. `98865` is a deprecated chain ID —
  never emit it.
- Token: TIP-20 (a precompiled token standard), 6 decimals; canonical bridged USDC is written
  **"USDC.e"**, not "USDC".
- Custom "Tempo Transaction" type (EIP-2718 type `0x76`) with **2D nonces** and **dual signature
  domains** (`0x76` payer / `0x78` fee-payer), which is what enables gasless flows: the server
  sponsors gas via `feePayer: true` while the payer only signs the transfer.
- **Zero-amount charges** use a distinct `type: "proof"` credential — an EIP-712 signature over
  `{domain: {name: "MPP", version: "1", chainId}, types: {Proof: [{name: "challengeId", type: "string"}]}}`,
  i.e. a signed attestation binding to the Challenge id with no on-chain transfer at all. Use this
  for "prove you can pay" gates, long-running job auth, or unlock-then-free-access flows.
- **Sessions** (payment channels): reserve funds against a channel, draw down per request instead
  of settling per-request on-chain. Unclaimed reserved funds return automatically on expiry/close —
  this is MPP's only *built-in* refund mechanism (see `security-testing.md` for the `charge` intent,
  which has none).
- Docs vocabulary: never say "escrow" for reserved session funds — say **"reserve"** / "lock up".
- **Unconfirmed — verify before relying on it for security review:** research for this skill
  pinned down the exact Challenge-binding field for the EVM `authorization`/`permit2` types
  (`nonce`/witness = `keccak256(challenge.id + challenge.realm)`) and for Tempo's zero-amount
  `proof` type (signs `challengeId` directly), but **not** for Tempo's normal non-zero `charge`
  credential (the native "Tempo Transaction" EIP-2718 type `0x76`). Don't assume it's unbound —
  read `specs/methods/tempo/` in `tempoxyz/mpp-specs` or `mppx`'s `src/tempo/client/Charge.ts` /
  `src/tempo/server/Charge.ts` before auditing or reimplementing Tempo charge verification.
- **`tempo(...)` vs `tempo.charge(...)`:** both appear in real examples — bare `tempo({...})`
  passed directly into `methods: [...]` (seen in `mppx`'s own `examples/charge/src/server.ts`),
  and `tempo.charge({...})` (seen in the `compose()` JSDoc example and this skill's MCP example).
  The relationship between the two (is bare `tempo(...)` a shorthand that defaults to the charge
  intent, or does it register multiple intents at once?) was not confirmed by this skill's
  research. If your use case is single-intent (just `charge`), either form worked in the sources
  observed; for multi-intent registration or if the two produce different behavior, check
  `mppx`'s `src/tempo/index.ts` rather than assuming.

## `evm` — generic EVM / x402-compatible

Four credential `type`s, in order of preference:

1. **`permit2`** (RECOMMENDED) — client signs an off-chain **EIP-712** Permit2 (Uniswap)
   authorization; server submits on-chain and pays gas. Binding uses a `PaymentWitness` EIP-712
   struct: `challengeHash = keccak256(abi.encodePacked(challenge.id, challenge.realm))`.
2. **`authorization`** — **EIP-3009** `transferWithAuthorization` (for USDC/EURC-style tokens);
   the `nonce` is forced to equal `challengeHash`, which is what cryptographically binds the
   signature to this specific server-issued Challenge and prevents replay across Challenges.
3. **`transaction`** — client signs a full EIP-1559 transaction (RLP-encoded hex), pays their own
   gas, server broadcasts it.
4. **`hash`** — client broadcasts the transaction themselves and submits only the tx hash. Weakest
   binding of the four — fallback for custodial/hardware wallets that can't do arbitrary typed-data
   signing.

Built-in chains in `mppx` (`src/evm/Chains.ts`):

```ts
export const base = 8453
export const baseSepolia = 84532
export const celo = 42220
export const celoSepolia = 11142220
```

Any other EIP-155 chain works via config (`chainId`, RPC, asset address) — these four are just the
pre-wired defaults with known USDC addresses (`evm.assets.<network>.USDC`).

## `stripe` — cards / BNPL via Shared Payment Tokens

No client-side signature at all. The client obtains a single-use **Shared Payment Token**
(`spt_...`) via `stripe.sharedPayment.issuedTokens.create()`; the server verifies it via the
Stripe API by creating a `PaymentIntent` with `confirm: true`. Stripe Connect fields
(`application_fee_amount`, `on_behalf_of`, `transfer_data`) are available for platform-fee
routing on marketplaces.

**Security-critical:** SPT creation needs a Stripe *secret* key, so it must happen server-side,
proxied by your own backend — never let the client dictate amount/currency/expiry when you mint
the token on their behalf. See `mppx/stripe` server code and `accept-card-payments.mdx` in the
`tempoxyz/mpp` docs repo for the canonical flow.

## Choosing a method for a new integration

- Building a **stablecoin-first** product with sponsored gas and streaming/session billing →
  `tempo`.
- Need **broad EVM wallet compatibility** or want to also accept **x402** payments on the same
  route → `evm` (see `x402-interop.md`).
- Targeting **non-crypto users** (regular credit cards) → `stripe`.
- Anything else (Lightning, Solana, Hedera, Stellar, NEAR Intents) — fetch the actual spec file
  from `tempoxyz/mpp-specs/specs/methods/<name>/` before writing signing code; do not invent a
  payload shape from the pattern of the methods above, since each rail's native signing semantics
  differ.
