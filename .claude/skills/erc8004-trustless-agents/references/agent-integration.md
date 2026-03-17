# ERC-8004 AI Agent統合パターン

## TypeScript Agent統合

### セットアップ

```typescript
import {
  createPublicClient, createWalletClient,
  http, webSocket, type Address
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

// Agent wallet
const account = privateKeyToAccount(
  process.env.AGENT_PRIVATE_KEY as `0x${string}`
);

// Clients
const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.RPC_URL),
});

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(process.env.RPC_URL),
});

const wsClient = createPublicClient({
  chain: base,
  transport: webSocket(process.env.WS_RPC_URL),
});

// Contract addresses（全チェーン同一アドレス / CREATE2）
const IDENTITY_REGISTRY: Address = "0x...";
const REPUTATION_REGISTRY: Address = "0x...";
const VALIDATION_REGISTRY: Address = "0x...";
```

### ABI定義

```typescript
const identityRegistryAbi = [
  {
    name: "register",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "agentURI", type: "string" }],
    outputs: [{ name: "agentId", type: "uint256" }],
  },
  {
    name: "register",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentURI", type: "string" },
      {
        name: "metadata",
        type: "tuple[]",
        components: [
          { name: "metadataKey", type: "string" },
          { name: "metadataValue", type: "bytes" },
        ],
      },
    ],
    outputs: [{ name: "agentId", type: "uint256" }],
  },
  {
    name: "getMetadata",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "metadataKey", type: "string" },
    ],
    outputs: [{ name: "", type: "bytes" }],
  },
  {
    name: "setMetadata",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "metadataKey", type: "string" },
      { name: "metadataValue", type: "bytes" },
    ],
    outputs: [],
  },
  {
    name: "getAgentWallet",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "Registered",
    type: "event",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "agentURI", type: "string", indexed: false },
      { name: "owner", type: "address", indexed: true },
    ],
  },
] as const;

const reputationRegistryAbi = [
  {
    name: "giveFeedback",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "value", type: "int128" },
      { name: "valueDecimals", type: "uint8" },
      { name: "tag1", type: "string" },
      { name: "tag2", type: "string" },
      { name: "endpoint", type: "string" },
      { name: "feedbackURI", type: "string" },
      { name: "feedbackHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    name: "getSummary",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "clientAddresses", type: "address[]" },
      { name: "tag1", type: "string" },
      { name: "tag2", type: "string" },
    ],
    outputs: [
      { name: "count", type: "uint64" },
      { name: "summaryValue", type: "int128" },
      { name: "summaryValueDecimals", type: "uint8" },
    ],
  },
  {
    name: "readFeedback",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "clientAddress", type: "address" },
      { name: "feedbackIndex", type: "uint64" },
    ],
    outputs: [
      { name: "value", type: "int128" },
      { name: "valueDecimals", type: "uint8" },
      { name: "tag1", type: "string" },
      { name: "tag2", type: "string" },
      { name: "isRevoked", type: "bool" },
    ],
  },
  {
    name: "getClients",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    name: "NewFeedback",
    type: "event",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "clientAddress", type: "address", indexed: true },
      { name: "feedbackIndex", type: "uint64", indexed: false },
      { name: "value", type: "int128", indexed: false },
      { name: "valueDecimals", type: "uint8", indexed: false },
      { name: "indexedTag1", type: "string", indexed: true },
      { name: "tag1", type: "string", indexed: false },
      { name: "tag2", type: "string", indexed: false },
      { name: "endpoint", type: "string", indexed: false },
      { name: "feedbackURI", type: "string", indexed: false },
      { name: "feedbackHash", type: "bytes32", indexed: false },
    ],
  },
] as const;

const validationRegistryAbi = [
  {
    name: "validationRequest",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "validatorAddress", type: "address" },
      { name: "agentId", type: "uint256" },
      { name: "requestURI", type: "string" },
      { name: "requestHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    name: "validationResponse",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "requestHash", type: "bytes32" },
      { name: "response", type: "uint8" },
      { name: "responseURI", type: "string" },
      { name: "responseHash", type: "bytes32" },
      { name: "tag", type: "string" },
    ],
    outputs: [],
  },
  {
    name: "getValidationStatus",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "requestHash", type: "bytes32" }],
    outputs: [
      { name: "validatorAddress", type: "address" },
      { name: "agentId", type: "uint256" },
      { name: "response", type: "uint8" },
      { name: "responseHash", type: "bytes32" },
      { name: "tag", type: "string" },
      { name: "lastUpdate", type: "uint256" },
    ],
  },
  {
    name: "getSummary",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "validatorAddresses", type: "address[]" },
      { name: "tag", type: "string" },
    ],
    outputs: [
      { name: "count", type: "uint64" },
      { name: "avgResponse", type: "uint8" },
    ],
  },
] as const;
```

### Agent登録フロー

```typescript
import { keccak256, toHex, toBytes, encodeAbiParameters } from "viem";

class AgentRegistrar {
  /**
   * Agent を Identity Registry に登録
   */
  async registerAgent(
    agentURI: string,
    capabilities: string[],
    services: { name: string; endpoint: string; version: string }[],
  ): Promise<bigint> {
    // 1. Registration File を IPFS にアップロード
    const registrationFile = {
      type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
      name: `Agent-${account.address.slice(0, 8)}`,
      description: "AI Agent registered via ERC-8004",
      services,
      active: true,
      supportedTrust: ["reputation"],
    };
    const fileURI = await this.uploadToIPFS(registrationFile);

    // 2. メタデータ準備
    const metadata = capabilities.map((cap) => ({
      metadataKey: `capability:${cap}`,
      metadataValue: toBytes(cap),
    }));

    // 3. 登録トランザクション
    const hash = await walletClient.writeContract({
      address: IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      functionName: "register",
      args: [fileURI, metadata],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // 4. agentId をイベントから抽出
    const registeredLog = receipt.logs.find(
      (log) => log.address.toLowerCase() === IDENTITY_REGISTRY.toLowerCase()
    );
    const agentId = BigInt(registeredLog!.topics[1]!);

    console.log(`Agent registered with ID: ${agentId}`);
    return agentId;
  }

  private async uploadToIPFS(data: unknown): Promise<string> {
    // IPFS/Arweave/Filecoin等にアップロード
    return `ipfs://Qm${Date.now()}`;
  }
}
```

### レピュテーション管理

```typescript
class ReputationManager {
  /**
   * Agent にフィードバックを送信
   */
  async giveFeedback(
    agentId: bigint,
    score: number,       // 0-100
    tag: string,         // "starred" | "uptime" | "successRate" 等
    endpoint?: string,
    details?: object,
  ): Promise<void> {
    // オフチェーンフィードバック詳細をIPFSに保存
    let feedbackURI = "";
    let feedbackHash = "0x" + "0".repeat(64) as `0x${string}`;

    if (details) {
      feedbackURI = await this.uploadToIPFS(details);
      feedbackHash = keccak256(toHex(JSON.stringify(details)));
    }

    await walletClient.writeContract({
      address: REPUTATION_REGISTRY,
      abi: reputationRegistryAbi,
      functionName: "giveFeedback",
      args: [
        agentId,
        BigInt(score),          // int128 value
        0,                      // uint8 valueDecimals
        tag,                    // tag1
        "",                     // tag2
        endpoint ?? "",         // endpoint
        feedbackURI,            // feedbackURI
        feedbackHash,           // feedbackHash
      ],
    });

    console.log(`Feedback sent: Agent ${agentId}, score ${score}, tag ${tag}`);
  }

  /**
   * Agent のレピュテーションサマリーを取得
   */
  async getReputation(
    agentId: bigint,
    tag?: string,
  ): Promise<{
    count: bigint;
    averageScore: bigint;
    decimals: number;
  }> {
    // まずクライアント一覧を取得
    const clients = await publicClient.readContract({
      address: REPUTATION_REGISTRY,
      abi: reputationRegistryAbi,
      functionName: "getClients",
      args: [agentId],
    });

    if (clients.length === 0) {
      return { count: 0n, averageScore: 0n, decimals: 0 };
    }

    const summary = await publicClient.readContract({
      address: REPUTATION_REGISTRY,
      abi: reputationRegistryAbi,
      functionName: "getSummary",
      args: [agentId, clients, tag ?? "", ""],
    });

    return {
      count: BigInt(summary[0]),
      averageScore: BigInt(summary[1]),
      decimals: summary[2],
    };
  }

  private async uploadToIPFS(data: unknown): Promise<string> {
    return `ipfs://Qm${Date.now()}`;
  }
}
```

### Agent発見・選択

```typescript
class AgentDiscovery {
  /**
   * イベントログからAgent一覧を発見
   */
  async discoverAgents(
    fromBlock: bigint = 0n,
  ): Promise<Array<{
    agentId: bigint;
    owner: Address;
    uri: string;
  }>> {
    const logs = await publicClient.getContractEvents({
      address: IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      eventName: "Registered",
      fromBlock,
    });

    return logs.map((log) => ({
      agentId: BigInt(log.args.agentId!),
      owner: log.args.owner!,
      uri: log.args.agentURI!,
    }));
  }

  /**
   * レピュテーションスコアでフィルタリング
   */
  async findTrustedAgents(
    agentIds: bigint[],
    minScore: number,
    tag: string,
  ): Promise<bigint[]> {
    const reputationManager = new ReputationManager();
    const trusted: bigint[] = [];

    for (const agentId of agentIds) {
      const rep = await reputationManager.getReputation(agentId, tag);
      if (rep.count > 0n && Number(rep.averageScore) >= minScore) {
        trusted.push(agentId);
      }
    }

    return trusted;
  }

  /**
   * 検証ステータスでフィルタリング
   */
  async findValidatedAgents(
    agentIds: bigint[],
    minAvgResponse: number,
    validatorAddresses: Address[] = [],
  ): Promise<bigint[]> {
    const validated: bigint[] = [];

    for (const agentId of agentIds) {
      const summary = await publicClient.readContract({
        address: VALIDATION_REGISTRY,
        abi: validationRegistryAbi,
        functionName: "getSummary",
        args: [agentId, validatorAddresses, ""],
      });

      if (summary[0] > 0n && summary[1] >= minAvgResponse) {
        validated.push(agentId);
      }
    }

    return validated;
  }
}
```

### イベント監視

```typescript
class EventWatcher {
  /**
   * 新規Agent登録をリアルタイム監視
   */
  watchRegistrations(
    callback: (agentId: bigint, owner: Address, uri: string) => void,
  ) {
    wsClient.watchContractEvent({
      address: IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      eventName: "Registered",
      onLogs: (logs) => {
        for (const log of logs) {
          callback(
            BigInt(log.args.agentId!),
            log.args.owner!,
            log.args.agentURI!,
          );
        }
      },
    });
  }

  /**
   * 新規フィードバックをリアルタイム監視
   */
  watchFeedback(
    agentId: bigint,
    callback: (clientAddress: Address, value: bigint, tag1: string) => void,
  ) {
    wsClient.watchContractEvent({
      address: REPUTATION_REGISTRY,
      abi: reputationRegistryAbi,
      eventName: "NewFeedback",
      args: { agentId },
      onLogs: (logs) => {
        for (const log of logs) {
          callback(
            log.args.clientAddress!,
            BigInt(log.args.value!),
            log.args.tag1!,
          );
        }
      },
    });
  }
}
```

## Python Agent統合

```python
from web3 import Web3
from eth_account import Account
import json

class ERC8004Client:
    def __init__(
        self, rpc_url: str,
        identity_registry: str,
        reputation_registry: str,
        validation_registry: str,
        private_key: str
    ):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.account = Account.from_key(private_key)

        self.identity = self.w3.eth.contract(
            address=identity_registry,
            abi=json.load(open("abis/IdentityRegistry.json"))
        )
        self.reputation = self.w3.eth.contract(
            address=reputation_registry,
            abi=json.load(open("abis/ReputationRegistry.json"))
        )
        self.validation = self.w3.eth.contract(
            address=validation_registry,
            abi=json.load(open("abis/ValidationRegistry.json"))
        )

    def register_agent(self, agent_uri: str) -> int:
        tx = self.identity.functions.register(agent_uri).build_transaction({
            "from": self.account.address,
            "nonce": self.w3.eth.get_transaction_count(self.account.address),
        })
        signed = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        # Extract agentId from Registered event
        registered_event = self.identity.events.Registered().process_receipt(receipt)
        return registered_event[0]["args"]["agentId"]

    def give_feedback(
        self, agent_id: int, value: int,
        tag1: str = "", tag2: str = ""
    ):
        tx = self.reputation.functions.giveFeedback(
            agent_id, value, 0, tag1, tag2, "", "", b'\x00' * 32
        ).build_transaction({
            "from": self.account.address,
            "nonce": self.w3.eth.get_transaction_count(self.account.address),
        })
        signed = self.account.sign_transaction(tx)
        self.w3.eth.send_raw_transaction(signed.raw_transaction)

    def get_reputation(self, agent_id: int, clients: list[str],
                       tag1: str = "") -> dict:
        count, value, decimals = self.reputation.functions.getSummary(
            agent_id, clients, tag1, ""
        ).call()
        return {"count": count, "value": value, "decimals": decimals}

    def request_validation(
        self, validator: str, agent_id: int,
        request_uri: str, request_hash: bytes
    ):
        tx = self.validation.functions.validationRequest(
            validator, agent_id, request_uri, request_hash
        ).build_transaction({
            "from": self.account.address,
            "nonce": self.w3.eth.get_transaction_count(self.account.address),
        })
        signed = self.account.sign_transaction(tx)
        self.w3.eth.send_raw_transaction(signed.raw_transaction)
```

## ERC-8183 Agentic Commerce との統合パターン

```typescript
/**
 * ERC-8004でAgent発見 → ERC-8183でJob委託のフルフロー
 */
class AgentCommerceOrchestrator {
  private discovery = new AgentDiscovery();
  private reputation = new ReputationManager();

  async commissionWork(
    description: string,
    budget: bigint,
    requiredCapability: string,
    minReputationScore: number,
  ) {
    // 1. ERC-8004: Agent発見
    const allAgents = await this.discovery.discoverAgents();
    const agentIds = allAgents.map((a) => a.agentId);

    // 2. ERC-8004: レピュテーションフィルタ
    const trusted = await this.discovery.findTrustedAgents(
      agentIds, minReputationScore, "starred"
    );

    if (trusted.length === 0) {
      throw new Error("No trusted agents found");
    }

    // 3. ERC-8004: 検証済みAgentフィルタ
    const validated = await this.discovery.findValidatedAgents(trusted, 80);
    const selectedAgentId = validated[0] ?? trusted[0];

    // 4. ERC-8004: Agent Wallet取得
    const providerWallet = await publicClient.readContract({
      address: IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      functionName: "getAgentWallet",
      args: [selectedAgentId],
    });

    // 5. ERC-8183: Job作成・資金供託
    // （ERC-8183 SKILLのAgent統合パターンを参照）
    console.log(`Selected agent ${selectedAgentId} (wallet: ${providerWallet})`);

    // 6. Job完了後 → ERC-8004にフィードバック
    // await this.reputation.giveFeedback(selectedAgentId, 95, "starred");
  }
}
```

## RPC要件

| 操作 | メソッド | 用途 |
|------|---------|------|
| Agent登録 | `eth_sendRawTransaction` | 低頻度 |
| メタデータ読み取り | `eth_call` | 高頻度 |
| フィードバック送信 | `eth_sendRawTransaction` | 中頻度 |
| Agent発見（ログ） | `eth_getLogs` | 中頻度 |
| リアルタイム監視 | `eth_subscribe` (WS) | 常時 |

**推奨RPC構成:**
- HTTPS endpoint: 読み取り + トランザクション送信
- WebSocket endpoint: リアルタイムイベント監視
- Archive node: 全Agent履歴の発見
