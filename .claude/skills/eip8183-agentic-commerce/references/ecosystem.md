# ERC-8183 エコシステム統合ガイド

## エコシステム全体像

```
┌─────────────────────────────────────────────────────┐
│               AI Agent Economy Stack                 │
├─────────────────────────────────────────────────────┤
│  Discovery    │ ERC-8004 (Identity/Reputation)       │
│               │ - Agent登録・発見                     │
│               │ - 能力広告・信頼スコア                │
├───────────────┼─────────────────────────────────────┤
│  Commerce     │ ERC-8183 (Agentic Commerce)          │
│               │ - Job escrow + evaluator attestation  │
│               │ - 非同期マルチステップ作業             │
├───────────────┼─────────────────────────────────────┤
│  Payments     │ x402 (HTTP Payments)                  │
│               │ - 同期的APIアクセス課金               │
│               │ - マイクロペイメント                  │
├───────────────┼─────────────────────────────────────┤
│  Extensions   │ ERC-2771 (Meta-transactions)          │
│               │ ERC-2612 (Permit / Gasless approval)  │
│               │ EAS (Ethereum Attestation Service)    │
└───────────────┴─────────────────────────────────────┘
```

## ERC-8004（Agent Identity/Reputation）連携

### 概要
ERC-8004はAI Agentのオンチェーンアイデンティティと評判管理の標準。
85,788以上のAgentが18+のEVMチェーンで登録済み。

### ERC-8183との連携ポイント

1. **Agent発見**: ERC-8004レジストリからProvider/Evaluator候補を検索
2. **レピュテーションゲート**: HookでERC-8004スコアに基づくアクセス制御
3. **実績蓄積**: Job完了/拒否イベントのreasonハッシュをERC-8004にフィードバック

### 統合コード例

```solidity
// ERC-8004 レジストリからスコアを取得し、Providerを選択
interface IERC8004Registry {
    function getAgent(address agent) external view returns (
        string memory name,
        string memory capabilities,
        uint256 reputationScore,
        uint256 totalJobs,
        uint256 completedJobs
    );
    function addAttestation(
        address agent,
        bytes32 reason,
        bool positive
    ) external;
}

// Hook内でレピュテーション更新
function afterAction(uint256 jobId, bytes4 selector, bytes calldata data) external {
    if (selector == IAgenticCommerce.complete.selector) {
        (bytes32 reason, ) = abi.decode(data, (bytes32, bytes));
        // Job完了 → Providerに正のアテステーション
        erc8004Registry.addAttestation(
            jobs[jobId].provider,
            reason,
            true  // positive
        );
    }
}
```

### Agent TypeScript統合

```typescript
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const client = createPublicClient({ chain: base, transport: http() });

// ERC-8004レジストリからAgent検索
async function findProviders(capability: string, minScore: number) {
  const agents = await client.readContract({
    address: ERC8004_REGISTRY,
    abi: erc8004Abi,
    functionName: "findAgentsByCapability",
    args: [capability],
  });

  return agents.filter((a) => a.reputationScore >= minScore);
}

// Jobの結果をレピュテーションに反映
async function updateReputation(jobId: bigint, provider: string, positive: boolean) {
  const job = await client.readContract({
    address: ACP_ADDRESS,
    abi: acpAbi,
    functionName: "getJob",
    args: [jobId],
  });
  // ERC-8004にアテステーション送信
}
```

## x402（HTTP Payments）連携

### 使い分け

| 特性 | x402 | ERC-8183 |
|------|------|----------|
| 支払いモデル | 同期・即時 | 非同期・エスクロー |
| 用途 | APIアクセス、データ取得 | マルチステップ作業、成果物納品 |
| 評価 | なし（サービス即時提供） | Evaluatorによる検証 |
| 典型コスト | $0.001-$0.05 | $1-$10,000+ |
| ガス | 低（L2シングルTx） | 高（4+ Tx） |

### ハイブリッドパターン

```typescript
// 小額・即時 → x402
async function fetchData(url: string) {
  const response = await fetch(url, {
    headers: {
      "X-402-Payment": await createX402Payment(0.01), // $0.01
    },
  });
  return response.json();
}

// 大額・非同期・要評価 → ERC-8183
async function commissionWork(description: string, budget: bigint) {
  const jobId = await acpContract.write.createJob([
    providerAddress,
    evaluatorAddress,
    BigInt(Math.floor(Date.now() / 1000) + 86400 * 7), // 7 days
    description,
    hookAddress,
  ]);
  // ... fund, wait for submission, evaluate
}
```

## ERC-2771（Meta-transactions）対応

ガスレス取引をサポートすることで、AgentがETHを持たずにJob操作できる。

```solidity
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract AgenticCommerceGasless is AgenticCommerce, ERC2771Context {
    constructor(address trustedForwarder)
        ERC2771Context(trustedForwarder) {}

    // _msgSender()を使用して全ての認可チェックを行う
    function fund(uint256 jobId, uint256 expectedBudget, bytes calldata optParams)
        external override nonReentrant
    {
        Job storage job = _jobs[jobId];
        if (_msgSender() != job.client) revert Unauthorized();
        // ...
    }
}
```

### ERC-2612（Permit）との組み合わせ

approve + fund を1トランザクションで実行：

```typescript
// Client側: approve不要でfund
const { v, r, s } = await signPermit(token, client, acpAddress, budget, deadline);
await token.write.permit([client, acpAddress, budget, deadline, v, r, s]);
await acp.write.fund([jobId, budget, "0x"]);
```

## Virtuals Protocol連携

Virtuals ProtocolはERC-8183の共同策定者であり、
AI Agent間商取引インフラの主要実装者。

### ACP (Agent Commerce Protocol)
VirtualsのACPはERC-8183のプロダクション実装として機能。
Agent間の通信・取引を標準化するフレームワーク。

## デプロイ推奨チェーン

| チェーン | タイプ | コスト/Job | 推奨用途 |
|---------|--------|-----------|---------|
| Ethereum L1 | L1 | $20-50 | 高価値Job、最高セキュリティ |
| Base | L2 (OP) | ~$0.50 | 一般的なAgent取引 |
| Arbitrum | L2 (Optimistic) | ~$0.30 | 一般的なAgent取引 |
| Optimism | L2 (OP) | ~$0.50 | OP Stack連携 |
| Polygon zkEVM | L2 (ZK) | ~$0.10 | 高頻度・低コスト |

**推奨**: L2（Base/Arbitrum）でのデプロイが実質必須。
L1は高価値Jobまたはブリッジ/決済レイヤーとして使用。

## 競合/代替プロトコルとの比較

| 特性 | ERC-8183 | OpenAI ACP | Google UCP | Alkahest |
|------|----------|-----------|-----------|----------|
| 発見 | ERC-8004 | OpenAI marketplace | `.well-known/ucp` | EAS |
| 支払い | ERC-20 escrow | Stripe | Web2 | Generic escrow |
| エスクロー | スマートコントラクト | プラットフォーム | なし | Abstract escrow |
| 評価 | 独立Evaluator | プラットフォーム | Self-report | Abstract arbiter |
| 信頼モデル | Trustless | Platform trust | Merchant trust | Trustless |
| パーミッションレス | Yes | No | Semi | Yes |
| 最適用途 | Agent-to-Agent on-chain | Human→Agent | Human→Merchant | 汎用escrow |

## 市場データ（2026年3月時点）

- Web3 AI Agent市場: $4.34B時価総額、550+プロジェクト
- ERC-8004登録Agent: 85,788+（18+ EVMチェーン）
- x402取引量: $600M+（2025年9月以降）
- 2028年AI Agent購買予測: $15 trillion（Gartner）
