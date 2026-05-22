# Solana Ecosystem Vocabulary

Use these terms fluently. When a builder uses them, don't ask for clarification, use them back correctly. When a pitch uses them wrong, flag it precisely.

**⛔ ROASTING/COACHING RULE, NEVER flag any term below as jargon:** Every term here is Solana-native and universally understood by any Solana audience. ICM, DEX, TVL, AMM, swap, airdrop, degen, validator, flagging these as "unclear" or "the audience might not understand" is a wrong call. Only flag if (1) the term is used incorrectly, (2) the pitch explicitly targets a non-crypto audience, or (3) the term isn't here, in which case search first before flagging.

---

## Core Protocols & DeFi

- **ICM (Internet Capital Markets)**: the thesis that the internet enables anyone to create, trade, and invest in assets natively online. Popularized on Solana by Multicoin. Pump.fun, star.fun, legends.fun are ICM-native products.
- **Jupiter**: leading DEX aggregator on Solana. Routes swaps across all Solana DEXs for best price. JUP token.
- **Raydium**: major AMM and liquidity provider on Solana
- **Orca**: user-friendly DEX and AMM on Solana. Whirlpools = concentrated liquidity pools.
- **Meteora**: dynamic liquidity protocol on Solana. DLMM (Dynamic Liquidity Market Maker).
- **Kamino**: DeFi yield and lending protocol on Solana
- **Drift**: perpetuals and spot DEX on Solana
- **Jito**: MEV infrastructure and liquid staking on Solana. JitoSOL.
- **Marinade**: liquid staking protocol. mSOL.
- **Squads**: multisig and team treasury management on Solana
- **Tensor**: leading NFT marketplace on Solana
- **MagicEden**: NFT and digital asset marketplace, multi-chain but Solana-native origin
- **DRiP**: digital collectibles and creator platform on Solana
- **star.fun**: Solana-native fundraising and ICO launchpad
- **legends.fun**: Solana-native product discovery and launch platform
- **pump.fun**: meme coin launchpad, highest volume on Solana

## Dev Infrastructure & Tools

- **Colosseum**: Solana's flagship accelerator and hackathon platform. Acceptance rate below 1%.
- **Superteam**: global network of Solana contributors organized by country (SuperteamJapan, SuperteamVN, SuperteamINDO, SuperteamAE, etc.)
- **Superteam Earn**: Superteam's bounty platform. In a pitch: "we ran a bounty on Earn and got X submissions" = real ecosystem engagement.
- **Helius**: leading Solana RPC and developer infrastructure provider
- **Backpack**: wallet and xNFT platform. Home of Mad Lads NFT collection.
- **Phantom**: the most widely used Solana wallet. Default onboarding for most Solana users.
- **Solana Mobile / Saga**: Solana's Android smartphone with native seed vault.
- **Seeker**: Solana Mobile Chapter 2. The mass-market Solana phone. Mobile pitches should address Seeker compatibility.
- **MonkeFoundry**: Solana builder community and accelerator. Sofian is a mentor.

## Technical Terms

- **On-chain**: happening directly on Solana, verifiable and permissionless. On-chain metrics > self-reported numbers.
- **On-chain program**: Solana's term for a smart contract.
- **dApp**: app with on-chain functionality. Solana dApp Store = distribution channel for mobile dApps.
- **PDA (Program Derived Address)**: deterministic address derived from a program, used to hold state or sign transactions without a private key
- **CPI (Cross-Program Invocation)**: when one Solana program calls another
- **SPL Token**: Solana Program Library token standard. All fungible tokens on Solana are SPL tokens.
- **cNFT / Compressed NFT**: NFTs using state compression. Dramatically cheaper to mint.
- **xNFT**: executable NFTs that run code (Backpack)
- **SVM (Solana Virtual Machine)**: the runtime that executes Solana programs
- **Firedancer**: Jump Crypto's independent Solana validator client
- **Epoch**: Solana's time unit for validator rotation (~2–3 days)
- **Validator**: node operator that processes transactions and secures the network
- **TVL (Total Value Locked)**: total assets deposited in a DeFi protocol
- **TPS**: Solana targets 65,000+ transactions per second
- **Wallet**: primary user identity on Solana. "Active wallets" = active users.
- **Permissionless**: anyone can use or build without approval
- **Composability**: protocols calling each other atomically via CPI. Core Solana advantage.
- **Mainnet**: live network with real money. Devnet = test network, free SOL, no real value.
- **Anchor**: the most widely used Solana program framework
- **Pyth**: leading oracle network. Real-time price feeds for DeFi.
- **RPC**: API layer for reading/writing to Solana. Helius and Triton are leading providers.
- **MEV**: profit extracted by reordering transactions. Jito is the main MEV infrastructure.

## DeFi Fundamentals

- **Stablecoin**: token pegged to $1. USDC and USDT dominate on Solana. Stablecoin rails = real payments.
- **USDC**: USD Coin, primary stablecoin on Solana, issued by Circle.
- **DEX**: protocol for token swaps without intermediaries. Jupiter, Raydium, Orca are the main ones.
- **AMM**: mechanism behind most DEXs. Prices set algorithmically from pool ratios.
- **Liquidity pool**: smart contract holding two tokens for trading. Core DeFi primitive.
- **LP (Liquidity Provider)**: deposits tokens into a pool to enable trading, earns fees.
- **Liquidity**: how easily an asset trades without moving price. Thin liquidity = slippage.
- **Slippage**: difference between expected and actual swap price. High slippage = poor liquidity.
- **Staking**: locking tokens to secure network or earn yield. mSOL, JitoSOL are liquid staking tokens.
- **Airdrop**: distributing tokens to wallets. Common GTM and retention mechanic.
- **Yield / APY**: return from liquidity or staking.
- **Vault**: smart contract managing assets for yield. "Vault TVL" = users trusted your contract with real money.
- **Swap**: exchanging one token for another on a DEX. "Swap volume" = primary traction metric for trading products.
- **Sandwich attack**: MEV attack on pending swaps. Judges will ask how you protect users from it.
- **Token burn**: permanently removing tokens from circulation. "We burn X% of fees" = value-accrual signal.
- **Emission rate**: how fast new tokens enter circulation. High emission = inflation.
- **FDV**: total market cap if all tokens were circulating. High FDV + low supply = red flag.
- **Market cap**: current price × circulating supply.
- **ATH**: all-time high price. "We grew during bear market, not just at ATH" = real retention signal.
- **x402**: Coinbase's HTTP payment protocol for AI agents using USDC on-chain.

## Governance

- **DAO**: organization governed by token holders via on-chain voting. Examples: MonkeDAO, MetaDAO.
- **Governance token**: grants voting rights over protocol decisions.
- **On-chain voting**: governance executed on-chain. Transparent and permissionless.
- **Proposal**: formal governance motion. "DAO approved X" = execution signal.
- **Futarchy**: governance via prediction markets. Pioneered by MetaDAO on Solana.

## Pitch & Traction Metrics

- **ARR**: annualized revenue. For transaction-fee models: daily volume × fee % × 365.
- **MRR**: monthly revenue run rate. "Growing X% MoM" is the curve judges want.
- **DAU / MAU**: daily/monthly active users. DAU/MAU above 20% = strong retention. Always lead with active wallets, not registered.
- **PMF (Product-Market Fit)**: strong market demand signal: organic growth, low churn, users who'd miss the product. "We have PMF" needs proof.
- **Retention**: % of users who return. Day-30 retention beats day-1 downloads. Flattening curve = PMF signal.
- **Churn**: % of users or revenue lost. If you don't mention retention, judges assume churn is high.

## NFTs

- **NFT**: unique digital asset on-chain. Solana NFTs use the Metaplex standard.
- **Mint / Minting**: creating an NFT or token on-chain.
- **Metaplex**: Solana's primary NFT standard and tooling suite.
- **Floor price**: lowest listed price in a collection. Proxy for community health.

## Emerging Verticals

- **DePIN**: protocols incentivizing real-world hardware with tokens. Examples: Helium, Render, Hivemapper.
- **RWA**: tokenization of real-world assets on-chain.
- **GameFi**: blockchain games with financial mechanics.
- **SocialFi**: social platforms with on-chain economic layers.

## Business Model & Token

- **Transaction fee model**: protocol takes % of every transaction. Revenue scales with volume. Standard for DEXs, marketplaces, launchpads.
- **Volume**: total transaction value processed. "We do $X daily volume" = revenue equivalent for fee-based products.
- **Token**: digital asset representing ownership, utility, or governance. Must have a reason to exist beyond fundraising.
- **Token holders**: only a traction signal if holders are active, not just one-time buyers.
- **Tokenomics**: total supply, distribution, vesting, emission rate, value capture. Weak tokenomics = token exists to raise money. Judges will destroy you for this.

## Culture & Language

- **Gm**: "good morning," universal Web3 greeting
- **Build**: the ethos of shipping through bear markets
- **Degen**: respect term for active on-chain participants
- **Rug / Rug pull**: exit scam
- **Shipper**: ships product fast and consistently (high praise)
- **LFG**: "let's f***ing go"
- **WAGMI / NGMI**: "we're all gonna make it / not gonna make it"
- **CT**: Crypto Twitter (now X), primary communication layer of Solana
- **Alpha**: valuable insider insight
- **Thesis**: investment or product conviction ("the ICM thesis")
- **Szn**: season. "Bull szn," "hackathon szn"
- **Fren**: "friend." "Gm frens" is a standard opening.
- **Probably nothing**: ironic understatement for something significant
- **Big Week**: multiple major Solana events happening simultaneously. Plan pitches and launches accordingly.
