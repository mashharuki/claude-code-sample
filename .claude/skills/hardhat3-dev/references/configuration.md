# Hardhat 3 設定リファレンス

## 設定ファイルの基本形

```typescript
import { defineConfig, configVariable } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";

export default defineConfig({
  plugins: [hardhatToolboxViem],
  solidity: { /* ... */ },
  networks: { /* ... */ },
  paths: { /* ... */ },
  test: { /* ... */ },
  tasks: [ /* ... */ ],
});
```

## パス設定

| オプション | デフォルト | 説明 |
|-----------|---------|------|
| `paths.sources` | `"./contracts"` | コントラクトディレクトリ |
| `paths.tests` | `"./test"` | テストディレクトリ（文字列またはオブジェクト） |
| `paths.cache` | `"./cache"` | キャッシュディレクトリ |
| `paths.artifacts` | `"./artifacts"` | アーティファクトディレクトリ |

テストパスはランナー別に指定可能：
```typescript
paths: {
  tests: {
    solidity: "./solidity-tests",
    nodejs: "./ts-tests",
    mocha: "./mocha-tests",
  }
}
```

## Solidity設定

### シンプル（バージョン指定のみ）
```typescript
solidity: "0.8.28"
```

### バージョン配列
```typescript
solidity: ["0.7.6", "0.8.28"]
```

### 詳細設定
```typescript
solidity: {
  version: "0.8.28",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    evmVersion: "shanghai",
    viaIR: true,
  },
}
```

### 複数コンパイラ
```typescript
solidity: {
  compilers: [
    { version: "0.7.6" },
    {
      version: "0.8.28",
      settings: { optimizer: { enabled: true, runs: 200 } },
    },
  ],
  overrides: {
    "contracts/legacy/Old.sol": { version: "0.6.12" },
  },
}
```

### ビルドプロファイル
```typescript
solidity: {
  profiles: {
    default: { version: "0.8.28" },
    production: {
      version: "0.8.28",
      settings: { optimizer: { enabled: true, runs: 200 } },
    },
  },
}
```

### カスタムコンパイラ（solx等）
```typescript
solidity: {
  version: "0.8.29",
  path: "/path/to/solx",
}
```

## ネットワーク設定

### EDRシミュレーションネットワーク（ローカル開発）

```typescript
networks: {
  hardhat: {
    type: "edr-simulated",
    chainType: "l1",           // "l1" | "op" | "generic"
    chainId: 31337,
    // アカウント設定
    accounts: [
      { privateKey: "0x...", balance: "10000000000000000000000" },
    ],
    // または HD Wallet
    accounts: {
      mnemonic: "test test test...",
      path: "m/44'/60'/0'/0",
      initialIndex: 0,
      count: 20,
      accountsBalance: "10000000000000000000000",
    },
    // ブロック設定
    blockGasLimit: 30_000_000,
    hardfork: "osaka",         // byzantium〜osaka
    initialBaseFeePerGas: 1_000_000_000n,
    // マイニング設定
    mining: {
      auto: true,
      interval: 0,
      mempool: "fifo",         // "fifo" | "priority"
    },
    // フォーク設定
    forking: {
      url: "https://mainnet.infura.io/v3/...",
      blockNumber: 19000000,
      enabled: true,
    },
    // その他
    allowUnlimitedContractSize: false,
    loggingEnabled: false,
    throwOnCallFailures: true,
    throwOnTransactionFailures: true,
  },
}
```

### HTTPネットワーク（テストネット・メインネット）

```typescript
networks: {
  sepolia: {
    type: "http",
    chainType: "l1",
    url: configVariable("SEPOLIA_RPC_URL"),
    accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    // または HD Wallet
    accounts: {
      mnemonic: configVariable("MNEMONIC"),
      path: "m/44'/60'/0'/0",
      initialIndex: 0,
      count: 5,
    },
    // またはリモートアカウント
    accounts: "remote",
    httpHeaders: {},
    timeout: 20000,
    gasMultiplier: 1,
  },
}
```

### configVariable（秘密情報管理）

```typescript
import { configVariable } from "hardhat/config";

// 環境変数から自動読み込み
url: configVariable("SEPOLIA_RPC_URL"),

// 暗号化ディスクストレージ（プラグイン）
// npm add --save-dev @nomicfoundation/hardhat-encrypted-storage
```

## Solidityテスト設定

```typescript
test: {
  solidity: {
    timeout: 40000,
    ffi: false,              // FFIチートコード有効化
    isolate: false,          // コール分離モード
    from: "0x1804c8AB1F12E6bbf3894d4083f33e07309d1f38",
    txOrigin: "0x1804c8AB1F12E6bbf3894d4083f33e07309d1f38",
    initialBalance: "0xffffffffffffffffffffffff",
    gasLimit: 9007199254740991n,
    blockBaseFeePerGas: 0,
    // ファイルシステムパーミッション
    fsPermissions: {
      readFile: ["./data"],
      writeFile: ["./output"],
    },
    // ファズテスト設定
    fuzz: {
      runs: 256,
      maxTestRejects: 65536,
      seed: "0x...",
      dictionaryWeight: 40,
      includeStorage: true,
      includePushBytes: true,
    },
    // インバリアントテスト設定
    invariant: {
      runs: 256,
      depth: 500,
      failOnRevert: false,
      callOverride: false,
      shrinkRunLimit: 5000,
    },
    // フォーク設定
    forking: {
      url: "https://mainnet.infura.io/v3/...",
      blockNumber: 19000000,
      rpcEndpoints: {
        optimism: "https://optimism-rpc.example.com",
      },
    },
  },
}
```

## プラグイン設定

### Viem Toolbox
```typescript
paths: {
  tests: { nodejs: "./test" },
}
```

### Ethers Toolbox（Mocha）
```typescript
paths: {
  tests: { mocha: "./test" },
},
test: {
  mocha: {
    timeout: 40000,
    // Mochaの全オプションが使用可能
  },
}
```

### TypeChain（Ethersのみ）
```typescript
typechain: {
  outDir: "./types",
  alwaysGenerateOverloads: false,
  dontOverrideCompile: false,
  discriminateTypes: false,
  tsNocheck: false,
}
```

## タスク定義

```typescript
import { task } from "hardhat/config";

// インラインアクション（小さなタスク向け）
const myTask = task("my-task", "タスクの説明")
  .addParam("name", "パラメータの説明")
  .addOptionalParam("count", "オプションパラメータ", 1)
  .setInlineAction(async ({ name, count }, hre) => {
    const { provider } = await hre.network.connect();
    console.log(`Hello ${name}, count: ${count}`);
  })
  .build();

// 別ファイルのアクション（大きなタスク向け、遅延読み込み）
const bigTask = task("big-task", "大きなタスク")
  .setAction(import("./tasks/big-task.js"))
  .build();

export default defineConfig({
  tasks: [myTask, bigTask],
});
```

## HRE（Hardhat Runtime Environment）

```typescript
// グローバルインポート
import hre from "hardhat";

// ネットワーク接続
const { viem, networkHelpers, ignition, provider } = await hre.network.connect();

// プログラマティックな複数インスタンス
import { createHardhatRuntimeEnvironment } from "hardhat/hre";
const hre1 = await createHardhatRuntimeEnvironment(config1);
const hre2 = await createHardhatRuntimeEnvironment(config2);
```
