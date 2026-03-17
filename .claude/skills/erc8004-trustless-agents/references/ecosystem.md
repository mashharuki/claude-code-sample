# ERC-8004 エコシステム統合ガイド

## エコシステム全体像

```
┌─────────────────────────────────────────────────────┐
│               AI Agent Economy Stack                 │
├─────────────────────────────────────────────────────┤
│  Discovery &  │ ERC-8004 (Trustless Agents)          │
│  Trust        │ - Identity Registry (ERC-721 Agent ID)│
│               │ - Reputation Registry (フィードバック) │
│               │ - Validation Registry (第三者検証)     │
├───────────────┼─────────────────────────────────────┤
│  Commerce     │ ERC-8183 (Agentic Commerce)          │
│               │ - Job escrow + evaluator attestation  │
│               │ - 非同期マルチステップ作業             │
├───────────────┼─────────────────────────────────────┤
│  Payments     │ x402 (HTTP Payments)                  │
│               │ - 同期的APIアクセス課金               │
│               │ - マイクロペイメント                  │
├───────────────┼─────────────────────────────────────┤
│  Communication│ A2A (Agent2Agent Protocol)            │
│  Protocols    │ MCP (Model Context Protocol)          │
│               │ ENS / DID (識別子連携)                │
├───────────────┼─────────────────────────────────────┤
│  Extensions   │ ERC-2771 (Meta-transactions)          │
│               │ EIP-7702 (EOA delegation)             │
│               │ ERC-1271 (Smart wallet signatures)    │
└───────────────┴─────────────────────────────────────┘
```

## ERC-8183（Agentic Commerce）連携

### 連携ポイント

1. **Agent発見**: ERC-8004 Identity RegistryからProvider/Evaluator候補を検索
2. **レピュテーションゲート**: ERC-8183のHookでERC-8004スコアに基づくアクセス制御
3. **実績蓄積**: Job完了/拒否イベントのreasonハッシュをReputation Registryにフィードバック

### レピュテーションゲートHook

```solidity
// ERC-8183のHookとしてERC-8004スコアをチェック
interface IReputationRegistry {
    function getSummary(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2
    ) external view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals);

    function getClients(uint256 agentId) external view returns (address[] memory);
}

interface IIdentityRegistry {
    function getAgentWallet(uint256 agentId) external view returns (address);
}

contract ReputationGateHook is IACPHook {
    IReputationRegistry public reputationRegistry;
    IIdentityRegistry public identityRegistry;
    int128 public minScore;

    constructor(address _reputation, address _identity, int128 _minScore) {
        reputationRegistry = IReputationRegistry(_reputation);
        identityRegistry = IIdentityRegistry(_identity);
        minScore = _minScore;
    }

    function beforeAction(uint256 jobId, bytes4 selector, bytes calldata data)
        external override
    {
        // fund()時にProviderのレピュテーションチェック
        if (selector == bytes4(keccak256("fund(uint256,uint256,bytes)"))) {
            // Provider agentIdをoptParamsから取得
            // または provider addressから逆引き
        }
    }

    function afterAction(uint256 jobId, bytes4 selector, bytes calldata data)
        external override
    {
        // complete()時にProviderのレピュテーション更新
        if (selector == bytes4(keccak256("complete(uint256,bytes32,bytes)"))) {
            // giveFeedback to provider's agentId
        }
    }
}
```

### フルフロー

```typescript
// 1. ERC-8004でAgent発見
const agents = await discoveryClient.discoverAgents();

// 2. レピュテーションでフィルタ
const trusted = await discoveryClient.findTrustedAgents(
  agents.map(a => a.agentId),
  80,       // minScore
  "starred" // tag
);

// 3. Agent Wallet取得
const providerWallet = await identityRegistry.read.getAgentWallet([
  trusted[0]
]);

// 4. ERC-8183でJob作成（レピュテーションゲートHook付き）
const jobId = await acpContract.write.createJob([
  providerWallet,
  evaluatorAddress,
  expiredAt,
  "Analyze DeFi data",
  reputationGateHookAddress,  // ERC-8004連携Hook
]);

// 5. Job完了後 → ERC-8004にフィードバック
await reputationRegistry.write.giveFeedback([
  trusted[0],   // agentId
  95n,           // value
  0,             // decimals
  "starred",     // tag1
  "agentic-commerce", // tag2
  "",            // endpoint
  feedbackURI,   // feedbackURI
  feedbackHash,  // feedbackHash
]);
```

## A2A（Agent2Agent）プロトコル統合

### Registration Fileでのサービス登録

```json
{
  "services": [
    {
      "name": "A2A",
      "endpoint": "https://agent.example.com/.well-known/agent.json",
      "version": "0.3.0"
    }
  ]
}
```

### A2Aフィードバック連携

```json
{
  "a2a": {
    "skills": ["DataAnalysis", "CodeGeneration"],
    "contextId": "ctx_abc123",
    "taskId": "task_xyz789"
  }
}
```

A2Aタスク完了時にERC-8004 Reputation Registryにフィードバックを送信し、
タスク結果の品質をオンチェーンで記録する。

## MCP（Model Context Protocol）統合

### Registration Fileでのサービス登録

```json
{
  "services": [
    {
      "name": "MCP",
      "endpoint": "https://agent.example.com/mcp",
      "version": "1.0.0"
    }
  ]
}
```

### MCPフィードバック連携

```json
{
  "mcp": {
    "tool": "GetStockPrice"
  }
}
```

MCPツール呼び出し結果の品質をERC-8004でトラッキング。
特定ツールの成功率・レイテンシをタグベースで記録。

## x402（HTTP Payments）連携

### 使い分け

| 特性 | x402 | ERC-8004 + ERC-8183 |
|------|------|---------------------|
| 目的 | APIアクセス課金 | Agent発見 + 信頼 + 取引 |
| 支払い | 同期・即時 | 非同期・エスクロー |
| フィードバック | なし | Reputation Registry |
| 典型コスト | $0.001-$0.05 | $1-$10,000+ |

### ハイブリッドパターン

```typescript
// x402での支払い後にERC-8004でフィードバック
async function callPaidAPI(agentId: bigint, url: string) {
  // 1. x402で同期支払い
  const response = await fetch(url, {
    headers: {
      "X-402-Payment": await createX402Payment(0.01),
    },
  });
  const result = await response.json();

  // 2. 結果の品質をERC-8004に記録
  await reputationRegistry.write.giveFeedback([
    agentId,
    response.ok ? 100n : 0n,
    0,
    "successRate",
    "x402",
    url,
    "",
    "0x" + "0".repeat(64),
  ]);

  return result;
}
```

## EIP-7702 / Account Abstraction 対応

### EIP-7702活用

EIP-7702により、EOAがスマートコントラクトの機能を一時的に委譲可能。
Agent登録やフィードバック送信でガスレス操作を実現。

```solidity
// setAgentWalletのEIP-7702対応
// ECDSA検証 → EIP-7702 delegated EOAs にも対応
(address recovered, ECDSA.RecoverError err, ) =
    ECDSA.tryRecover(digest, signature);
```

### ERC-1271対応

スマートコントラクトウォレット（Safe, Kernel等）をAgent Walletに設定可能：

```solidity
// ERC-1271フォールバック
(bool ok, bytes memory res) = newWallet.staticcall(
    abi.encodeCall(IERC1271.isValidSignature, (digest, signature))
);
require(ok && abi.decode(res, (bytes4)) == ERC1271_MAGICVALUE);
```

## Subgraph統合

### スキーマ例

```graphql
type Agent @entity {
  id: ID!
  agentId: BigInt!
  owner: Bytes!
  uri: String!
  wallet: Bytes
  metadata: [AgentMetadata!]! @derivedFrom(field: "agent")
  feedbacksReceived: [Feedback!]! @derivedFrom(field: "agent")
  validations: [Validation!]! @derivedFrom(field: "agent")
  registeredAt: BigInt!
}

type AgentMetadata @entity {
  id: ID!
  agent: Agent!
  key: String!
  value: Bytes!
}

type Feedback @entity {
  id: ID!
  agent: Agent!
  client: Bytes!
  feedbackIndex: BigInt!
  value: BigInt!
  valueDecimals: Int!
  tag1: String!
  tag2: String!
  endpoint: String
  feedbackURI: String
  feedbackHash: Bytes
  isRevoked: Boolean!
  createdAt: BigInt!
}

type Validation @entity {
  id: ID!
  agent: Agent!
  validator: Bytes!
  requestHash: Bytes!
  requestURI: String
  response: Int
  responseHash: Bytes
  tag: String
  hasResponse: Boolean!
  lastUpdate: BigInt!
}
```

### クエリ例

```graphql
# トップAgent（フィードバック数順）
query TopAgents {
  agents(
    orderBy: feedbacksReceived__count
    orderDirection: desc
    first: 20
  ) {
    agentId
    owner
    uri
    wallet
    feedbacksReceived(where: { isRevoked: false }) {
      value
      tag1
    }
  }
}

# 特定タグでのAgent検索
query AgentsByCapability($tag: String!) {
  feedbacks(
    where: { tag1: $tag, isRevoked: false }
    orderBy: value
    orderDirection: desc
  ) {
    agent {
      agentId
      uri
    }
    value
  }
}
```

## 関連プロジェクト・実装

| プロジェクト | 説明 | リンク |
|------------|------|--------|
| erc-8004-contracts | 公式リファレンス実装 | github.com/erc-8004/erc-8004-contracts |
| Chaos Chain | 信頼性エージェント実装 | GitHub |
| Phala | TEEエージェント実装 | GitHub |
| Zpaynow | Rust実装 | GitHub |
| Agent0 SDK | クイックスタートSDK | GitHub |
| Registry Brokers | Agent検索プラットフォーム | Web |

## 市場データ

- ERC-8004登録Agent: 85,788+（18+ EVMチェーン）
- 35+ネットワークにデプロイ済み
- Web3 AI Agent市場: $4.34B時価総額、550+プロジェクト
- 2028年AI Agent購買予測: $15 trillion（Gartner）
