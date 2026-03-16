# ERC-8183 AI Agent統合パターン

## TypeScript Agent統合

### セットアップ

```typescript
import { createPublicClient, createWalletClient, http, webSocket } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

// Agent wallet
const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`);

// Public client (読み取り用)
const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.RPC_URL),
});

// Wallet client (書き込み用)
const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(process.env.RPC_URL),
});

// WebSocket client (イベント監視用)
const wsClient = createPublicClient({
  chain: base,
  transport: webSocket(process.env.WS_RPC_URL),
});
```

### ABI定義

```typescript
const acpAbi = [
  {
    name: "createJob",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "provider", type: "address" },
      { name: "evaluator", type: "address" },
      { name: "expiredAt", type: "uint256" },
      { name: "description", type: "string" },
      { name: "hook", type: "address" },
    ],
    outputs: [{ name: "jobId", type: "uint256" }],
  },
  {
    name: "fund",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "expectedBudget", type: "uint256" },
      { name: "optParams", type: "bytes" },
    ],
    outputs: [],
  },
  {
    name: "submit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "deliverable", type: "bytes32" },
      { name: "optParams", type: "bytes" },
    ],
    outputs: [],
  },
  {
    name: "complete",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "reason", type: "bytes32" },
      { name: "optParams", type: "bytes" },
    ],
    outputs: [],
  },
  {
    name: "getJob",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "client", type: "address" },
          { name: "provider", type: "address" },
          { name: "evaluator", type: "address" },
          { name: "description", type: "string" },
          { name: "budget", type: "uint256" },
          { name: "expiredAt", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "hook", type: "address" },
        ],
      },
    ],
  },
  // Events
  {
    name: "JobCreated",
    type: "event",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "client", type: "address" },
      { name: "provider", type: "address" },
      { name: "evaluator", type: "address" },
      { name: "expiredAt", type: "uint256" },
    ],
  },
  {
    name: "JobFunded",
    type: "event",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "client", type: "address" },
      { name: "amount", type: "uint256" },
    ],
  },
  {
    name: "JobSubmitted",
    type: "event",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "provider", type: "address" },
      { name: "deliverable", type: "bytes32" },
    ],
  },
  {
    name: "JobCompleted",
    type: "event",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "evaluator", type: "address" },
      { name: "reason", type: "bytes32" },
    ],
  },
] as const;
```

### Client Agent（依頼者）

```typescript
import { keccak256, toHex, parseUnits } from "viem";

class ClientAgent {
  private acpAddress: `0x${string}`;
  private tokenAddress: `0x${string}`;

  constructor(acpAddress: `0x${string}`, tokenAddress: `0x${string}`) {
    this.acpAddress = acpAddress;
    this.tokenAddress = tokenAddress;
  }

  async createAndFundJob(
    provider: `0x${string}`,
    evaluator: `0x${string}`,
    description: string,
    budget: bigint,
    durationSeconds: number,
    hook: `0x${string}` = "0x0000000000000000000000000000000000000000",
  ): Promise<bigint> {
    const expiredAt = BigInt(Math.floor(Date.now() / 1000) + durationSeconds);

    // 1. Create Job
    const createHash = await walletClient.writeContract({
      address: this.acpAddress,
      abi: acpAbi,
      functionName: "createJob",
      args: [provider, evaluator, expiredAt, description, hook],
    });
    const createReceipt = await publicClient.waitForTransactionReceipt({
      hash: createHash,
    });

    // Extract jobId from event
    const jobCreatedLog = createReceipt.logs.find(
      (log) => log.topics[0] === keccak256(toHex("JobCreated(uint256,address,address,address,uint256)")),
    );
    const jobId = BigInt(jobCreatedLog!.topics[1]!);

    // 2. Set Budget
    await walletClient.writeContract({
      address: this.acpAddress,
      abi: acpAbi,
      functionName: "setBudget",
      args: [jobId, budget, "0x"],
    });

    // 3. Approve token
    await walletClient.writeContract({
      address: this.tokenAddress,
      abi: [
        {
          name: "approve",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ name: "", type: "bool" }],
        },
      ],
      functionName: "approve",
      args: [this.acpAddress, budget],
    });

    // 4. Fund
    await walletClient.writeContract({
      address: this.acpAddress,
      abi: acpAbi,
      functionName: "fund",
      args: [jobId, budget, "0x"],
    });

    console.log(`Job ${jobId} created and funded with ${budget}`);
    return jobId;
  }
}
```

### Provider Agent（実行者）

```typescript
class ProviderAgent {
  private acpAddress: `0x${string}`;

  constructor(acpAddress: `0x${string}`) {
    this.acpAddress = acpAddress;
  }

  // イベント監視で新規Jobを検知
  async watchForJobs() {
    wsClient.watchContractEvent({
      address: this.acpAddress,
      abi: acpAbi,
      eventName: "JobFunded",
      onLogs: async (logs) => {
        for (const log of logs) {
          const jobId = log.args.jobId!;
          const job = await publicClient.readContract({
            address: this.acpAddress,
            abi: acpAbi,
            functionName: "getJob",
            args: [jobId],
          });

          if (job.provider === account.address) {
            await this.executeJob(jobId, job.description);
          }
        }
      },
    });
  }

  async executeJob(jobId: bigint, description: string) {
    console.log(`Executing job ${jobId}: ${description}`);

    // 1. 作業実行（AI処理等）
    const result = await this.doWork(description);

    // 2. 成果物をIPFSにアップロード
    const deliverableHash = keccak256(toHex(JSON.stringify(result)));

    // 3. Submit
    await walletClient.writeContract({
      address: this.acpAddress,
      abi: acpAbi,
      functionName: "submit",
      args: [jobId, deliverableHash, "0x"],
    });

    console.log(`Job ${jobId} submitted with deliverable ${deliverableHash}`);
  }

  private async doWork(description: string): Promise<unknown> {
    // AI処理、データ分析、コード生成等
    // 実際のAgent実装に合わせてカスタマイズ
    return { result: "completed", description };
  }
}
```

### Evaluator Agent（評価者）

```typescript
class EvaluatorAgent {
  private acpAddress: `0x${string}`;

  constructor(acpAddress: `0x${string}`) {
    this.acpAddress = acpAddress;
  }

  async watchForSubmissions() {
    wsClient.watchContractEvent({
      address: this.acpAddress,
      abi: acpAbi,
      eventName: "JobSubmitted",
      onLogs: async (logs) => {
        for (const log of logs) {
          const jobId = log.args.jobId!;
          const job = await publicClient.readContract({
            address: this.acpAddress,
            abi: acpAbi,
            functionName: "getJob",
            args: [jobId],
          });

          if (job.evaluator === account.address) {
            await this.evaluateJob(jobId, log.args.deliverable!);
          }
        }
      },
    });
  }

  async evaluateJob(jobId: bigint, deliverableHash: `0x${string}`) {
    console.log(`Evaluating job ${jobId}`);

    // 1. 成果物を取得（IPFSから等）
    const deliverable = await this.fetchDeliverable(deliverableHash);

    // 2. 評価実行（AI、ZK検証、手動等）
    const { approved, reason } = await this.evaluate(deliverable);

    // 3. complete or reject
    const reasonHash = keccak256(toHex(reason));

    if (approved) {
      await walletClient.writeContract({
        address: this.acpAddress,
        abi: acpAbi,
        functionName: "complete",
        args: [jobId, reasonHash, "0x"],
      });
      console.log(`Job ${jobId} completed`);
    } else {
      await walletClient.writeContract({
        address: this.acpAddress,
        abi: acpAbi,
        functionName: "reject",
        args: [jobId, reasonHash, "0x"],
      });
      console.log(`Job ${jobId} rejected: ${reason}`);
    }
  }

  private async fetchDeliverable(hash: `0x${string}`): Promise<unknown> {
    // IPFSやArweaveから成果物を取得
    return {};
  }

  private async evaluate(deliverable: unknown): Promise<{
    approved: boolean;
    reason: string;
  }> {
    // マルチモデル合意パターン例
    const models = ["gpt-4", "claude-opus", "gemini-pro"];
    let approvals = 0;

    for (const model of models) {
      const result = await this.callAIModel(model, deliverable);
      if (result.approved) approvals++;
    }

    const approved = approvals / models.length >= 0.7; // 70%合意
    return {
      approved,
      reason: approved ? "Quality standards met" : "Quality below threshold",
    };
  }

  private async callAIModel(
    model: string,
    deliverable: unknown,
  ): Promise<{ approved: boolean }> {
    // 各AIモデルに成果物を評価させる
    return { approved: true };
  }
}
```

## Python Agent統合

```python
from web3 import Web3
from eth_account import Account
import json

class AgenticCommerceClient:
    def __init__(self, rpc_url: str, contract_address: str, private_key: str):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.account = Account.from_key(private_key)
        self.contract = self.w3.eth.contract(
            address=contract_address,
            abi=json.load(open("abi/AgenticCommerce.json"))
        )

    def create_job(
        self,
        provider: str,
        evaluator: str,
        description: str,
        duration_seconds: int,
        hook: str = "0x0000000000000000000000000000000000000000"
    ) -> int:
        expired_at = int(time.time()) + duration_seconds
        tx = self.contract.functions.createJob(
            provider, evaluator, expired_at, description, hook
        ).build_transaction({
            "from": self.account.address,
            "nonce": self.w3.eth.get_transaction_count(self.account.address),
        })
        signed = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        # Extract jobId from event logs
        return self._extract_job_id(receipt)

    def fund_job(self, job_id: int, budget: int):
        # Approve token first
        # Then call fund
        tx = self.contract.functions.fund(
            job_id, budget, b""
        ).build_transaction({
            "from": self.account.address,
            "nonce": self.w3.eth.get_transaction_count(self.account.address),
        })
        signed = self.account.sign_transaction(tx)
        self.w3.eth.send_raw_transaction(signed.raw_transaction)

    def submit_deliverable(self, job_id: int, deliverable_hash: bytes):
        tx = self.contract.functions.submit(
            job_id, deliverable_hash, b""
        ).build_transaction({
            "from": self.account.address,
            "nonce": self.w3.eth.get_transaction_count(self.account.address),
        })
        signed = self.account.sign_transaction(tx)
        self.w3.eth.send_raw_transaction(signed.raw_transaction)
```

## 運用パターン

### 並行Job管理

Agent管理が50+の並行Jobを管理する場合のパターン:

```typescript
class JobManager {
  private activeJobs: Map<bigint, Job> = new Map();
  private pollInterval = 30_000; // 30秒

  async start() {
    // WebSocketでリアルタイム監視
    this.watchEvents();
    // フォールバック: eth_getLogsでポーリング
    setInterval(() => this.pollMissedEvents(), this.pollInterval);
  }

  private watchEvents() {
    wsClient.watchContractEvent({
      address: ACP_ADDRESS,
      abi: acpAbi,
      eventName: "JobCreated",
      onLogs: (logs) => this.handleNewJobs(logs),
    });
    // ... 他のイベントも同様
  }

  // WebSocket切断時のフォールバック
  private async pollMissedEvents() {
    const currentBlock = await publicClient.getBlockNumber();
    const logs = await publicClient.getContractEvents({
      address: ACP_ADDRESS,
      abi: acpAbi,
      fromBlock: currentBlock - 100n,
      toBlock: currentBlock,
    });
    // 処理...
  }
}
```

### Expiryモニタリング

```typescript
// 期限切れJobの自動返金請求
async function monitorExpiries() {
  const jobCount = await publicClient.readContract({
    address: ACP_ADDRESS,
    abi: acpAbi,
    functionName: "jobCounter",
  });

  for (let i = 0n; i < jobCount; i++) {
    const job = await publicClient.readContract({
      address: ACP_ADDRESS,
      abi: acpAbi,
      functionName: "getJob",
      args: [i],
    });

    const isExpirable = job.status === 1 || job.status === 2; // Funded or Submitted
    const isPastExpiry = BigInt(Math.floor(Date.now() / 1000)) > job.expiredAt;

    if (isExpirable && isPastExpiry) {
      await walletClient.writeContract({
        address: ACP_ADDRESS,
        abi: acpAbi,
        functionName: "claimRefund",
        args: [i],
      });
      console.log(`Claimed refund for expired job ${i}`);
    }
  }
}
```

## RPC要件

| 操作 | メソッド | 頻度（50 Jobs/agent） |
|------|---------|---------------------|
| 状態読み取り | `eth_call` | ~100/hour |
| トランザクション送信 | `eth_sendRawTransaction` | ~50/hour |
| イベント監視 | `eth_subscribe` (WebSocket) | リアルタイム |
| 履歴ログ取得 | `eth_getLogs` | ~10/hour (フォールバック) |
| ガス見積もり | `eth_estimateGas` | ~50/hour |

**推奨RPC構成:**
- HTTPS endpoint: 状態読み取り + トランザクション送信
- WebSocket endpoint: リアルタイムイベント監視
- Archive node: 履歴Job監査・レピュテーション分析
